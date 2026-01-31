// Database types for Supabase

export type SubscriptionTier = "free" | "pro" | "enterprise";
export type ProjectStatus = "draft" | "generating" | "ready" | "rendering" | "complete" | "error";
export type RenderJobStatus = "pending" | "processing" | "complete" | "failed";
export type VideoFormat = "landscape" | "portrait" | "square";
export type UsageAction = "script_generation" | "video_generation" | "voiceover" | "render";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  credits_remaining: number;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  prompt: string | null;
  status: ProjectStatus;
  script: Record<string, unknown> | null;
  video_config: Record<string, unknown> | null;
  voiceover_url: string | null;
  music_url: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  resolution_width: number;
  resolution_height: number;
  format: VideoFormat;
  created_at: string;
  updated_at: string;
  rendered_at: string | null;
}

export interface RenderJob {
  id: string;
  project_id: string;
  user_id: string;
  status: RenderJobStatus;
  progress: number;
  lambda_render_id: string | null;
  lambda_function_name: string | null;
  output_url: string | null;
  file_size_bytes: number | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface UsageLog {
  id: string;
  user_id: string;
  action: UsageAction;
  credits_used: number;
  project_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, "id">>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Project, "id" | "user_id">>;
      };
      render_jobs: {
        Row: RenderJob;
        Insert: Omit<RenderJob, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<RenderJob, "id" | "project_id" | "user_id">>;
      };
      usage_logs: {
        Row: UsageLog;
        Insert: Omit<UsageLog, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: never;
      };
    };
    Functions: {
      decrement_user_credits: {
        Args: { user_uuid: string; credits_to_use: number };
        Returns: boolean;
      };
    };
  };
}
