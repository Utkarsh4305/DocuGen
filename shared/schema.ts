import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  originalTechStack: jsonb("original_tech_stack").notNull(),
  targetTechStack: jsonb("target_tech_stack"),
  files: jsonb("files").notNull(),
  astData: jsonb("ast_data"),
  uirData: jsonb("uir_data"),
  convertedFiles: jsonb("converted_files"),
  status: text("status").notNull().default("uploaded"), // uploaded, analyzing, converting, completed, failed
  progress: integer("progress").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversionJobs = pgTable("conversion_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  fromFramework: text("from_framework").notNull(),
  toFramework: text("to_framework").notNull(),
  layer: text("layer").notNull(), // frontend, backend, database
  options: jsonb("options").default({}),
  status: text("status").notNull().default("pending"),
  progress: integer("progress").default(0),
  result: jsonb("result"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const supportedFrameworks = pgTable("supported_frameworks", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  icon: text("icon"),
  frameworks: jsonb("frameworks").default([]),
  maturity: text("maturity").notNull(),
  difficulty: text("difficulty").notNull(),
  bidirectionalSupport: boolean("bidirectional_support").default(true),
});

// Insert schemas
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConversionJobSchema = createInsertSchema(conversionJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFrameworkSchema = createInsertSchema(supportedFrameworks);

// Update schemas
export const updateProjectSchema = insertProjectSchema.partial();
export const updateConversionJobSchema = insertConversionJobSchema.partial();

// Types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;

export type ConversionJob = typeof conversionJobs.$inferSelect;
export type InsertConversionJob = z.infer<typeof insertConversionJobSchema>;
export type UpdateConversionJob = z.infer<typeof updateConversionJobSchema>;

export type SupportedFramework = typeof supportedFrameworks.$inferSelect;
export type InsertFramework = z.infer<typeof insertFrameworkSchema>;

// API Response types
export interface TechStackAnalysis {
  languages: Array<{
    language: string;
    percentage: number;
    files: number;
    icon: string;
    purpose: string;
  }>;
  frameworks: string[];
  totalFiles: number;
  totalLines: number;
}

export interface UIRNode {
  id: string;
  type: string;
  name?: string;
  props?: Record<string, any>;
  children?: UIRNode[];
  metadata?: Record<string, any>;
}

export interface ConversionResult {
  success: boolean;
  files: Array<{
    path: string;
    content: string;
    type: string;
  }>;
  errors?: string[];
  warnings?: string[];
}
