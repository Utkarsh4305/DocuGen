import { 
  type Project, 
  type InsertProject, 
  type UpdateProject,
  type ConversionJob,
  type InsertConversionJob,
  type UpdateConversionJob,
  type SupportedFramework,
  type InsertFramework
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Project methods
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: UpdateProject): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  getAllProjects(): Promise<Project[]>;

  // Conversion job methods
  getConversionJob(id: string): Promise<ConversionJob | undefined>;
  createConversionJob(job: InsertConversionJob): Promise<ConversionJob>;
  updateConversionJob(id: string, updates: UpdateConversionJob): Promise<ConversionJob | undefined>;
  getJobsByProject(projectId: string): Promise<ConversionJob[]>;

  // Framework methods
  getSupportedFrameworks(): Promise<SupportedFramework[]>;
  createFramework(framework: InsertFramework): Promise<SupportedFramework>;
  getFrameworksByCategory(category: string): Promise<SupportedFramework[]>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private conversionJobs: Map<string, ConversionJob>;
  private frameworks: Map<string, SupportedFramework>;

  constructor() {
    this.projects = new Map();
    this.conversionJobs = new Map();
    this.frameworks = new Map();
    this.initializeFrameworks();
  }

  private initializeFrameworks() {
    const frameworks: SupportedFramework[] = [
      {
        id: "react",
        name: "React",
        category: "Frontend Web Development",
        description: "Component-based UI library for building interactive interfaces",
        icon: "fab fa-react",
        frameworks: ["JSX", "Hooks", "Virtual DOM"],
        maturity: "High",
        difficulty: "Medium",
        bidirectionalSupport: true,
      },
      {
        id: "typescript",
        name: "TypeScript",
        category: "Frontend Web Development",
        description: "Statically typed superset of JavaScript for better development",
        icon: "fab fa-js-square",
        frameworks: ["Types", "Interfaces", "IntelliSense"],
        maturity: "High",
        difficulty: "Medium",
        bidirectionalSupport: true,
      },
      {
        id: "nodejs",
        name: "Node.js",
        category: "Backend/API Development",
        description: "JavaScript runtime for server-side development and APIs",
        icon: "fab fa-node-js",
        frameworks: ["Express", "NPM", "Async"],
        maturity: "High",
        difficulty: "Medium",
        bidirectionalSupport: true,
      },
      {
        id: "python",
        name: "Python",
        category: "Backend/API Development",
        description: "High-level programming language for web APIs and data processing",
        icon: "fab fa-python",
        frameworks: ["FastAPI", "Django", "Flask"],
        maturity: "High",
        difficulty: "Low",
        bidirectionalSupport: true,
      },
      {
        id: "flutter",
        name: "Flutter",
        category: "Mobile Development",
        description: "Cross-platform mobile development with Dart language",
        icon: "fas fa-mobile-alt",
        frameworks: ["Dart", "Widgets", "Hot Reload"],
        maturity: "Medium",
        difficulty: "Medium",
        bidirectionalSupport: true,
      },
      {
        id: "go",
        name: "Go",
        category: "Systems Programming",
        description: "Fast, compiled language for microservices and system programming",
        icon: "fas fa-code",
        frameworks: ["Goroutines", "Gin", "Fast"],
        maturity: "High",
        difficulty: "Medium",
        bidirectionalSupport: true,
      }
    ];

    frameworks.forEach(framework => {
      this.frameworks.set(framework.id, framework);
    });
  }

  // Project methods
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      ...insertProject,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: UpdateProject): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject: Project = {
      ...project,
      ...updates,
      updatedAt: new Date(),
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  // Conversion job methods
  async getConversionJob(id: string): Promise<ConversionJob | undefined> {
    return this.conversionJobs.get(id);
  }

  async createConversionJob(insertJob: InsertConversionJob): Promise<ConversionJob> {
    const id = randomUUID();
    const job: ConversionJob = {
      ...insertJob,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.conversionJobs.set(id, job);
    return job;
  }

  async updateConversionJob(id: string, updates: UpdateConversionJob): Promise<ConversionJob | undefined> {
    const job = this.conversionJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob: ConversionJob = {
      ...job,
      ...updates,
      updatedAt: new Date(),
    };
    this.conversionJobs.set(id, updatedJob);
    return updatedJob;
  }

  async getJobsByProject(projectId: string): Promise<ConversionJob[]> {
    return Array.from(this.conversionJobs.values()).filter(job => job.projectId === projectId);
  }

  // Framework methods
  async getSupportedFrameworks(): Promise<SupportedFramework[]> {
    return Array.from(this.frameworks.values());
  }

  async createFramework(framework: InsertFramework): Promise<SupportedFramework> {
    this.frameworks.set(framework.id, framework);
    return framework;
  }

  async getFrameworksByCategory(category: string): Promise<SupportedFramework[]> {
    return Array.from(this.frameworks.values()).filter(f => f.category === category);
  }
}

export const storage = new MemStorage();
