import { eq } from "drizzle-orm";
import { db } from "./db";
import { 
  projects, 
  conversionJobs, 
  supportedFrameworks,
  type Project, 
  type InsertProject, 
  type UpdateProject,
  type ConversionJob,
  type InsertConversionJob,
  type UpdateConversionJob,
  type SupportedFramework,
  type InsertFramework
} from "@shared/schema";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  constructor() {
    if (db) {
      this.initializeFrameworks();
    } else {
      throw new Error("Database connection not available. Please set DATABASE_URL environment variable.");
    }
  }

  private async initializeFrameworks() {
    if (!db) return;
    
    // Check if frameworks are already initialized
    const existing = await db.select().from(supportedFrameworks).limit(1);
    if (existing.length > 0) return;

    const frameworks: InsertFramework[] = [
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
      },
      {
        id: "vue",
        name: "Vue.js",
        category: "Frontend Web Development",
        description: "Progressive JavaScript framework for building user interfaces",
        icon: "fab fa-vuejs",
        frameworks: ["Composition API", "Reactive", "SFC"],
        maturity: "High",
        difficulty: "Low",
        bidirectionalSupport: true,
      },
      {
        id: "angular",
        name: "Angular",
        category: "Frontend Web Development",
        description: "Platform and framework for building single-page client applications",
        icon: "fab fa-angular",
        frameworks: ["Components", "Services", "DI"],
        maturity: "High",
        difficulty: "High",
        bidirectionalSupport: true,
      },
      {
        id: "kotlin",
        name: "Kotlin",
        category: "Mobile Development",
        description: "Modern programming language for Android development",
        icon: "fas fa-mobile-alt",
        frameworks: ["Jetpack Compose", "Coroutines", "DSL"],
        maturity: "High",
        difficulty: "Medium",
        bidirectionalSupport: true,
      },
      {
        id: "swift",
        name: "Swift",
        category: "Mobile Development",
        description: "Modern programming language for iOS development",
        icon: "fab fa-swift",
        frameworks: ["SwiftUI", "UIKit", "Combine"],
        maturity: "High",
        difficulty: "Medium",
        bidirectionalSupport: true,
      },
    ];

    try {
      await db.insert(supportedFrameworks).values(frameworks);
      console.log('✅ Initialized supported frameworks in database');
    } catch (error) {
      console.warn('⚠️ Could not initialize frameworks (they may already exist):', error);
    }
  }

  // Project methods
  async getProject(id: string): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return result[0];
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values(insertProject).returning();
    return result[0];
  }

  async updateProject(id: string, updates: UpdateProject): Promise<Project | undefined> {
    const result = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return result[0];
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount > 0;
  }

  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(projects.createdAt);
  }

  // Conversion job methods
  async getConversionJob(id: string): Promise<ConversionJob | undefined> {
    const result = await db.select().from(conversionJobs).where(eq(conversionJobs.id, id)).limit(1);
    return result[0];
  }

  async createConversionJob(insertJob: InsertConversionJob): Promise<ConversionJob> {
    const result = await db.insert(conversionJobs).values(insertJob).returning();
    return result[0];
  }

  async updateConversionJob(id: string, updates: UpdateConversionJob): Promise<ConversionJob | undefined> {
    const result = await db
      .update(conversionJobs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(conversionJobs.id, id))
      .returning();
    return result[0];
  }

  async getJobsByProject(projectId: string): Promise<ConversionJob[]> {
    return await db
      .select()
      .from(conversionJobs)
      .where(eq(conversionJobs.projectId, projectId))
      .orderBy(conversionJobs.createdAt);
  }

  // Framework methods
  async getSupportedFrameworks(): Promise<SupportedFramework[]> {
    return await db.select().from(supportedFrameworks).orderBy(supportedFrameworks.name);
  }

  async createFramework(framework: InsertFramework): Promise<SupportedFramework> {
    const result = await db.insert(supportedFrameworks).values(framework).returning();
    return result[0];
  }

  async getFrameworksByCategory(category: string): Promise<SupportedFramework[]> {
    return await db
      .select()
      .from(supportedFrameworks)
      .where(eq(supportedFrameworks.category, category))
      .orderBy(supportedFrameworks.name);
  }
}