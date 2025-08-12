import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { FileHandler } from "./utils/file-handler";
import { LanguageDetector } from "./services/language-detector";
import { TranspilerService } from "./services/transpiler";
import { insertProjectSchema, insertConversionJobSchema, updateProjectSchema, updateConversionJobSchema } from "@shared/schema";

// Configure multer for ZIP file uploads
const zipUpload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB for ZIP files
    files: 1, // Only one ZIP file
  },
  fileFilter: (req, file, cb) => {
    // Only allow ZIP files
    if (file.originalname.toLowerCase().endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  },
});

// Legacy multer for backwards compatibility
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 100, // Max 100 files
  },
  fileFilter: (req, file, cb) => {
    // Allow common code file types
    const allowedTypes = /\.(js|jsx|ts|tsx|py|dart|go|html|css|scss|sass|json|yaml|yml|md|txt)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  const fileHandler = new FileHandler();
  const languageDetector = new LanguageDetector();
  const transpiler = new TranspilerService();

  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get project by ID
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Add debug logging
      console.log(`Fetching project ${req.params.id}:`, {
        name: project.name,
        hasOriginalTechStack: !!project.originalTechStack,
        techStackKeys: project.originalTechStack ? Object.keys(project.originalTechStack) : [],
        filesCount: project.files ? (Array.isArray(project.files) ? project.files.length : 'not array') : 'no files'
      });
      
      res.json(project);
    } catch (error) {
      console.error(`Error fetching project ${req.params.id}:`, error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Upload and analyze ZIP project  
  app.post("/api/projects/upload-zip", (req, res, next) => {
    zipUpload.single('zipFile')(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ error: `Upload failed: ${err.message}` });
      }
      next();
    });
  }, async (req, res) => {
    try {
      // Log upload details for debugging
      console.log(`ZIP upload: ${req.file?.originalname} (${req.file?.size} bytes)`);
      
      if (!req.file) {
        return res.status(400).json({ error: "No ZIP file uploaded. Please select a .zip file." });
      }

      // Process uploaded ZIP file
      const uploadResult = await fileHandler.processZipFile(req.file);
      
      // Analyze tech stack
      const techStackAnalysis = languageDetector.analyzeProject(uploadResult.files);
      
      // Create project record
      const projectData = insertProjectSchema.parse({
        name: req.body.name || `Project ${Date.now()}`,
        originalTechStack: techStackAnalysis,
        files: uploadResult.files,
        status: "uploaded",
        progress: 0,
      });

      const project = await storage.createProject(projectData);
      
      res.json({
        project,
        analysis: techStackAnalysis,
        uploadResult: {
          totalFiles: uploadResult.totalFiles,
          totalSize: uploadResult.totalSize,
          files: uploadResult.files,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Convert project to target framework
  app.post("/api/projects/:id/convert", async (req, res) => {
    try {
      const { id } = req.params;
      const { fromFramework, toFramework, options } = req.body;

      if (!fromFramework || !toFramework) {
        return res.status(400).json({ error: "Missing fromFramework or toFramework" });
      }

      // Get project
      const project = await storage.getProject(id);
      if (!project || !project.files) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Convert files
      const conversionResult = await transpiler.transpileProject(
        project.files as any[],
        fromFramework,
        toFramework,
        options || {
          preserveStructure: true,
          maintainState: true,
          addTypeAnnotations: true,
          convertApiCalls: true
        }
      );

      if (!conversionResult.success) {
        return res.status(400).json({ 
          error: "Conversion failed", 
          details: conversionResult.errors 
        });
      }

      // Create ZIP file for download
      const zipBuffer = await fileHandler.createDownloadArchive(conversionResult.files);

      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${project.name}_converted_to_${toFramework}.zip"`,
        'Content-Length': zipBuffer.length.toString(),
      });

      res.send(zipBuffer);

    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Legacy upload and analyze project (for backwards compatibility)
  app.post("/api/projects/upload", upload.array('files'), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      // Process uploaded files
      const uploadResult = await fileHandler.processUploadedFiles(req.files);
      
      // Analyze tech stack
      const techStackAnalysis = languageDetector.analyzeProject(uploadResult.files);
      
      // Create project record
      const projectData = insertProjectSchema.parse({
        name: req.body.name || `Project ${Date.now()}`,
        originalTechStack: techStackAnalysis,
        files: uploadResult.files,
        status: "uploaded",
        progress: 0,
      });

      const project = await storage.createProject(projectData);
      
      res.json({
        project,
        analysis: techStackAnalysis,
        uploadResult: {
          totalFiles: uploadResult.totalFiles,
          totalSize: uploadResult.totalSize,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Analyze project tech stack
  app.post("/api/projects/:id/analyze", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Update project status
      await storage.updateProject(req.params.id, { 
        status: "analyzing",
        progress: 25,
      });

      // Perform analysis
      const files = project.files as Array<{ path: string; content: string }>;
      const analysis = languageDetector.analyzeProject(files);

      // Update project with analysis
      const updatedProject = await storage.updateProject(req.params.id, {
        originalTechStack: analysis,
        status: "analyzed",
        progress: 50,
      });

      res.json({
        project: updatedProject,
        analysis,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Start conversion job (alternative endpoint for legacy compatibility)
  app.post("/api/projects/:id/convert-job", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const conversionData = insertConversionJobSchema.parse({
        projectId: req.params.id,
        fromFramework: req.body.fromFramework,
        toFramework: req.body.toFramework,
        layer: req.body.layer || 'frontend',
        options: req.body.options || {},
        status: "pending",
        progress: 0,
      });

      const conversionJob = await storage.createConversionJob(conversionData);

      res.json({ conversionJob });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get conversion job status
  app.get("/api/conversion-jobs/:id", async (req, res) => {
    try {
      const job = await storage.getConversionJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Conversion job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get conversion jobs for a project
  app.get("/api/projects/:id/conversion-jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobsByProject(req.params.id);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Download converted project
  app.get("/api/projects/:id/download", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      if (!project.convertedFiles) {
        return res.status(400).json({ error: "No converted files available" });
      }

      const files = project.convertedFiles as Array<{ path: string; content: string }>;
      const archive = await fileHandler.createDownloadArchive(files);

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${project.name}_converted.zip"`);
      res.send(archive);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get supported frameworks
  app.get("/api/frameworks", async (req, res) => {
    try {
      const frameworks = await storage.getSupportedFrameworks();
      res.json(frameworks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get frameworks by category
  app.get("/api/frameworks/category/:category", async (req, res) => {
    try {
      const frameworks = await storage.getFrameworksByCategory(req.params.category);
      res.json(frameworks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Async conversion processing function
  async function processConversion(jobId: string, project: any, conversionData: any) {
    try {
      // Progress: 10% - Starting conversion
      await storage.updateConversionJob(jobId, {
        status: "processing",
        progress: 10,
      });
      await storage.updateProject(project.id, {
        status: "converting",
        progress: 10,
      });

      // Progress: 25% - Analyzing files
      await storage.updateConversionJob(jobId, { progress: 25 });
      await storage.updateProject(project.id, { progress: 25 });

      // Progress: 50% - Generating AST
      await storage.updateConversionJob(jobId, { progress: 50 });
      await storage.updateProject(project.id, { progress: 50 });

      // Progress: 75% - Creating UIR
      await storage.updateConversionJob(jobId, { progress: 75 });
      await storage.updateProject(project.id, { progress: 75 });

      // Progress: 90% - Transpiling
      await storage.updateConversionJob(jobId, { progress: 90 });
      await storage.updateProject(project.id, { progress: 90 });

      // Perform transpilation
      const files = project.files as Array<{ path: string; content: string }>;
      const conversionResult = await transpiler.transpileProject(
        files,
        conversionData.fromFramework,
        conversionData.toFramework,
        conversionData.options
      );

      if (conversionResult.success) {
        // Update job with results
        await storage.updateConversionJob(jobId, {
          status: "completed",
          progress: 100,
          result: conversionResult,
        });

        // Update project with converted files
        await storage.updateProject(project.id, {
          status: "completed",
          progress: 100,
          convertedFiles: conversionResult.files,
          targetTechStack: {
            framework: conversionData.toFramework,
            convertedAt: new Date().toISOString(),
          },
        });
      } else {
        // Handle conversion failure
        await storage.updateConversionJob(jobId, {
          status: "failed",
          error: conversionResult.errors?.join(', ') || "Conversion failed",
        });

        await storage.updateProject(project.id, {
          status: "failed",
        });
      }
    } catch (error) {
      // Handle processing error
      await storage.updateConversionJob(jobId, {
        status: "failed",
        error: error.message,
      });

      await storage.updateProject(project.id, {
        status: "failed",
      });
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
