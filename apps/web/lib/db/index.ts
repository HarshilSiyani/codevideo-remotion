import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

// Database file path - stored in project root
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "vizmo.db");

// Create SQLite connection
const sqlite = new Database(dbPath);

// Enable WAL mode for better concurrent performance
sqlite.pragma("journal_mode = WAL");

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

// Export schema for use in queries
export * from "./schema";

// Initialize database tables
export function initializeDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      credits_remaining INTEGER DEFAULT 10 NOT NULL,
      subscription_tier TEXT DEFAULT 'free' NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      prompt TEXT,
      status TEXT DEFAULT 'draft' NOT NULL,
      script TEXT,
      video_config TEXT,
      voiceover_url TEXT,
      music_url TEXT,
      video_url TEXT,
      thumbnail_url TEXT,
      duration_seconds INTEGER,
      resolution_width INTEGER DEFAULT 1920,
      resolution_height INTEGER DEFAULT 1080,
      format TEXT DEFAULT 'landscape',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      rendered_at TEXT
    );

    CREATE TABLE IF NOT EXISTS render_jobs (
      id TEXT PRIMARY KEY,
      project_id TEXT REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'pending' NOT NULL,
      progress REAL DEFAULT 0,
      lambda_render_id TEXT,
      lambda_function_name TEXT,
      output_url TEXT,
      file_size_bytes INTEGER,
      error_message TEXT,
      retry_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      started_at TEXT,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS usage_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      credits_used INTEGER DEFAULT 1,
      project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
      metadata TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    CREATE INDEX IF NOT EXISTS idx_render_jobs_project_id ON render_jobs(project_id);
    CREATE INDEX IF NOT EXISTS idx_render_jobs_status ON render_jobs(status);
    CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
  `);

  console.log("Database initialized at:", dbPath);
}
