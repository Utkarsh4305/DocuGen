import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { projects, conversionJobs, supportedFrameworks } from "@shared/schema";

let db: any = null;

if (process.env.DATABASE_URL) {
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql, {
    schema: {
      projects,
      conversionJobs,
      supportedFrameworks,
    },
  });
}

export { db };
export type DB = typeof db;