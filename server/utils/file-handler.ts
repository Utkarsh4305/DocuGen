import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";
import * as yauzl from "yauzl";
import * as archiver from "archiver";

export interface ProjectFile {
  path: string;
  content: string;
  size: number;
  type: string;
}

export interface UploadResult {
  projectId: string;
  files: ProjectFile[];
  totalSize: number;
  totalFiles: number;
}

export class FileHandler {
  private uploadDir: string;
  private maxFileSize: number = 10 * 1024 * 1024; // 10MB
  private maxTotalSize: number = 100 * 1024 * 1024; // 100MB
  private allowedExtensions: Set<string>;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDir();
    
    this.allowedExtensions = new Set([
      '.js', '.jsx', '.ts', '.tsx', '.py', '.dart', '.go',
      '.html', '.css', '.scss', '.sass', '.less',
      '.json', '.yaml', '.yml', '.md', '.txt',
      '.svg', '.png', '.jpg', '.jpeg', '.gif',
      '.woff', '.woff2', '.ttf', '.eot'
    ]);
  }

  private ensureUploadDir(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async processUploadedFiles(files: Express.Multer.File[]): Promise<UploadResult> {
    const projectId = randomUUID();
    const projectFiles: ProjectFile[] = [];
    let totalSize = 0;

    for (const file of files) {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(`Invalid file ${file.originalname}: ${validation.error}`);
      }

      // Read file content
      const content = await this.readFileContent(file);
      const projectFile: ProjectFile = {
        path: this.sanitizePath(file.originalname),
        content,
        size: file.size,
        type: this.getFileType(file.originalname),
      };

      projectFiles.push(projectFile);
      totalSize += file.size;

      // Check total size limit
      if (totalSize > this.maxTotalSize) {
        throw new Error(`Total upload size exceeds limit of ${this.maxTotalSize / 1024 / 1024}MB`);
      }
    }

    return {
      projectId,
      files: projectFiles,
      totalSize,
      totalFiles: projectFiles.length,
    };
  }

  async processZipFile(zipFile: Express.Multer.File): Promise<UploadResult> {
    const projectId = randomUUID();
    const projectFiles: ProjectFile[] = [];
    let totalSize = 0;

    return new Promise((resolve, reject) => {
      yauzl.open(zipFile.path, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(new Error(`Failed to open ZIP file: ${err.message}`));
          return;
        }

        zipfile.readEntry();
        
        zipfile.on("entry", (entry) => {
          // Skip directories and cache files with enhanced filtering
          if (this.shouldSkipFile(entry.fileName)) {
            zipfile.readEntry();
            return;
          }

          // Check file size limit
          if (entry.uncompressedSize > this.maxFileSize) {
            zipfile.readEntry();
            return;
          }

          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) {
              zipfile.readEntry();
              return;
            }

            const chunks: Buffer[] = [];
            readStream.on('data', (chunk) => chunks.push(chunk));
            readStream.on('end', () => {
              const content = Buffer.concat(chunks);
              const filePath = this.sanitizePath(entry.fileName);
              
              // Skip binary files or convert to placeholder
              let fileContent: string;
              if (this.isBinaryFile(filePath)) {
                fileContent = `[Binary file: ${path.basename(filePath)}]`;
              } else {
                fileContent = content.toString('utf-8');
              }

              const projectFile: ProjectFile = {
                path: filePath,
                content: fileContent,
                size: entry.uncompressedSize,
                type: this.getFileType(filePath),
              };

              projectFiles.push(projectFile);
              totalSize += entry.uncompressedSize;
              
              zipfile.readEntry();
            });
          });
        });

        zipfile.on("end", () => {
          // Clean up temporary zip file
          fs.unlinkSync(zipFile.path);
          
          resolve({
            projectId,
            files: projectFiles,
            totalSize,
            totalFiles: projectFiles.length,
          });
        });

        zipfile.on("error", (err) => {
          reject(new Error(`Error processing ZIP file: ${err.message}`));
        });
      });
    });
  }

  async processFolderUpload(folderData: any): Promise<UploadResult> {
    // Handle folder uploads from the browser
    // This would typically come from the HTML5 File API
    const projectId = randomUUID();
    const projectFiles: ProjectFile[] = [];
    let totalSize = 0;

    // Process folder structure
    for (const item of folderData) {
      if (item.webkitGetAsEntry) {
        const entry = item.webkitGetAsEntry();
        if (entry.isDirectory) {
          const dirFiles = await this.processDirectory(entry);
          projectFiles.push(...dirFiles);
        } else if (entry.isFile) {
          const file = await this.processFileEntry(entry);
          projectFiles.push(file);
        }
      }
    }

    // Calculate total size
    totalSize = projectFiles.reduce((sum, file) => sum + file.size, 0);

    return {
      projectId,
      files: projectFiles,
      totalSize,
      totalFiles: projectFiles.length,
    };
  }

  private async processDirectory(dirEntry: any): Promise<ProjectFile[]> {
    // Recursive directory processing
    // This is a simplified implementation
    return [];
  }

  private async processFileEntry(fileEntry: any): Promise<ProjectFile> {
    return new Promise((resolve, reject) => {
      fileEntry.file((file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            path: fileEntry.fullPath,
            content: reader.result as string,
            size: file.size,
            type: this.getFileType(file.name),
          });
        };
        reader.onerror = reject;
        reader.readAsText(file);
      });
    });
  }

  private validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `File size ${file.size} exceeds maximum of ${this.maxFileSize}`
      };
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!this.allowedExtensions.has(ext)) {
      return {
        valid: false,
        error: `File extension ${ext} is not allowed`
      };
    }

    // Check for suspicious file names
    if (file.originalname.includes('..') || file.originalname.includes('/')) {
      return {
        valid: false,
        error: 'Invalid file name'
      };
    }

    return { valid: true };
  }

  private async readFileContent(file: Express.Multer.File): Promise<string> {
    try {
      // Check if file is binary
      if (this.isBinaryFile(file.originalname)) {
        return `[Binary file: ${file.originalname}]`;
      }

      // Read as text
      const buffer = fs.readFileSync(file.path);
      return buffer.toString('utf-8');
    } catch (error) {
      throw new Error(`Could not read file ${file.originalname}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private isBinaryFile(filename: string): boolean {
    const binaryExtensions = new Set([
      '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico',
      '.woff', '.woff2', '.ttf', '.eot', '.otf',
      '.zip', '.tar', '.gz', '.rar', '.7z',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx',
      '.mp3', '.mp4', '.avi', '.mov', '.wmv'
    ]);

    const ext = path.extname(filename).toLowerCase();
    return binaryExtensions.has(ext);
  }

  private sanitizePath(originalPath: string): string {
    // Remove any dangerous path components
    return originalPath
      .replace(/\.\./g, '')
      .replace(/[\/\\]/g, '/')
      .replace(/^\/+/, '');
  }

  private getFileType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    
    const typeMap: Record<string, string> = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.dart': 'dart',
      '.go': 'go',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.sass': 'sass',
      '.less': 'less',
      '.json': 'json',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.md': 'markdown',
      '.txt': 'text',
      '.svg': 'svg',
      '.png': 'image',
      '.jpg': 'image',
      '.jpeg': 'image',
      '.gif': 'image',
    };

    return typeMap[ext] || 'unknown';
  }

  async saveProjectFiles(projectId: string, files: ProjectFile[]): Promise<void> {
    const projectDir = path.join(this.uploadDir, projectId);
    
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    for (const file of files) {
      const filePath = path.join(projectDir, file.path);
      const fileDir = path.dirname(filePath);
      
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, file.content, 'utf-8');
    }
  }

  async createDownloadArchive(files: Array<{ path: string; content: string }>): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const archive = archiver.default('zip', { zlib: { level: 9 } });
      const chunks: Buffer[] = [];

      archive.on('data', (chunk: Buffer) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', (err: Error) => reject(err));

      // Add files to archive
      for (const file of files) {
        archive.append(file.content, { name: file.path });
      }

      archive.finalize();
    });
  }

  private shouldSkipFile(fileName: string): boolean {
    const normalizedPath = fileName.toLowerCase();
    
    // Skip directories
    if (fileName.endsWith('/')) {
      return true;
    }

    // Cache and build directories to skip
    const skipPatterns = [
      'node_modules/',
      '.git/',
      '.svn/',
      '.hg/',
      'dist/',
      'build/',
      'out/',
      'target/',
      'bin/',
      'obj/',
      '.next/',
      '.nuxt/',
      '.output/',
      '.cache/',
      '.temp/',
      '.tmp/',
      'coverage/',
      '.nyc_output/',
      'logs/',
      '*.log',
      '.DS_Store',
      'Thumbs.db',
      '.env',
      '.env.local',
      '.env.development.local',
      '.env.test.local',
      '.env.production.local',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'composer.lock',
      'Pipfile.lock',
      'poetry.lock',
      'Gemfile.lock',
      '*.pyc',
      '__pycache__/',
      '.pytest_cache/',
      '.tox/',
      'venv/',
      'env/',
      '.venv/',
      '.idea/',
      '.vscode/',
      '*.swp',
      '*.swo',
      '*~',
    ];

    return skipPatterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(normalizedPath);
      }
      return normalizedPath.includes(pattern);
    });
  }

  cleanup(projectId: string): void {
    const projectDir = path.join(this.uploadDir, projectId);
    if (fs.existsSync(projectDir)) {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  }
}
