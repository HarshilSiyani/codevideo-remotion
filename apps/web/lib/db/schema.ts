import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Users table
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique().notNull(),
  name: text("name"),
  creditsRemaining: integer("credits_remaining").default(10).notNull(),
  subscriptionTier: text("subscription_tier", { enum: ["free", "pro", "enterprise"] }).default("free").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Projects table
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  prompt: text("prompt"),
  status: text("status", {
    enum: ["draft", "generating", "ready", "rendering", "complete", "error"]
  }).default("draft").notNull(),

  // JSON stored as text
  script: text("script"), // JSON string
  videoConfig: text("video_config"), // JSON string

  // Asset URLs
  voiceoverUrl: text("voiceover_url"),
  musicUrl: text("music_url"),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),

  // Metadata
  durationSeconds: integer("duration_seconds"),
  resolutionWidth: integer("resolution_width").default(1920),
  resolutionHeight: integer("resolution_height").default(1080),
  format: text("format", { enum: ["landscape", "portrait", "square"] }).default("landscape"),

  // Timestamps
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  renderedAt: text("rendered_at"),
});

// Render jobs table
export const renderJobs = sqliteTable("render_jobs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),

  status: text("status", {
    enum: ["pending", "processing", "complete", "failed"]
  }).default("pending").notNull(),
  progress: real("progress").default(0),

  // Lambda details
  lambdaRenderId: text("lambda_render_id"),
  lambdaFunctionName: text("lambda_function_name"),

  // Output
  outputUrl: text("output_url"),
  fileSizeBytes: integer("file_size_bytes"),

  // Error handling
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),

  // Timestamps
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
});

// Usage logs table
export const usageLogs = sqliteTable("usage_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),

  action: text("action", {
    enum: ["script_generation", "video_generation", "voiceover", "render"]
  }).notNull(),
  creditsUsed: integer("credits_used").default(1),

  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  metadata: text("metadata"), // JSON string

  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type RenderJob = typeof renderJobs.$inferSelect;
export type NewRenderJob = typeof renderJobs.$inferInsert;
export type UsageLog = typeof usageLogs.$inferSelect;
export type NewUsageLog = typeof usageLogs.$inferInsert;
