import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { VIDEO_CONFIG_GENERATION_PROMPT, VIZMO_SYSTEM_PROMPT } from "./prompts/system";
import type { GeneratedScript } from "./script-generator";

// Input for video config generation
export interface VideoConfigInput {
  script: GeneratedScript;
  format?: "landscape" | "portrait" | "square";
  voiceoverUrl?: string;
  musicUrl?: string;
}

// Video config schema (matches Remotion's expected input)
const backgroundSchema = z.object({
  type: z.enum(["solid", "gradient", "particles", "grid"]),
  colors: z.array(z.string()).optional(),
  color: z.string().optional(),
  backgroundColor: z.string().optional(),
  animated: z.boolean().optional(),
  density: z.enum(["low", "medium", "high"]).optional(),
});

const textElementSchema = z.object({
  type: z.enum(["title", "glitch", "typewriter", "kinetic", "fade"]),
  text: z.string(),
  fontSize: z.number().optional(),
  color: z.string().optional(),
  position: z.enum(["center", "top", "bottom", "left", "right"]).optional(),
  style: z.string().optional(),
  animation: z.object({
    delay: z.number().optional(),
    duration: z.number().optional(),
  }).optional(),
});

const transitionSchema = z.object({
  type: z.enum(["fade", "glitch", "zoom", "wipe", "none"]),
  duration: z.number().optional(),
});

const sceneSchema = z.object({
  id: z.string(),
  startTime: z.number(),
  duration: z.number(),
  background: backgroundSchema.optional(),
  elements: z.array(textElementSchema).optional(),
  transition: transitionSchema.optional(),
});

const audioSchema = z.object({
  voiceover: z.object({
    url: z.string(),
    volume: z.number().optional(),
  }).optional(),
  music: z.object({
    url: z.string(),
    volume: z.number().optional(),
  }).optional(),
});

export const videoConfigSchema = z.object({
  title: z.string(),
  duration: z.number(),
  fps: z.number().default(30),
  resolution: z.object({
    width: z.number(),
    height: z.number(),
  }),
  scenes: z.array(sceneSchema),
  audio: audioSchema.optional(),
});

export type GeneratedVideoConfig = z.infer<typeof videoConfigSchema>;

const FORMAT_RESOLUTIONS = {
  landscape: { width: 1920, height: 1080 },
  portrait: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
};

export async function generateVideoConfig(
  input: VideoConfigInput,
  apiKey?: string
): Promise<GeneratedVideoConfig> {
  const client = new Anthropic({
    apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
  });

  const resolution = FORMAT_RESOLUTIONS[input.format || "landscape"];

  const userPrompt = `Create a Remotion video configuration for this script:

Title: ${input.script.title}
Duration: ${input.script.duration} seconds
Hook: ${input.script.hook}
Main Points: ${input.script.mainPoints.join(", ")}
Conclusion: ${input.script.conclusion}
Voiceover Script: ${input.script.voiceoverScript}
Style: ${input.script.suggestedStyle}

Resolution: ${resolution.width}x${resolution.height}

${input.voiceoverUrl ? `Voiceover URL: ${input.voiceoverUrl}` : "Voiceover URL: VOICEOVER_PLACEHOLDER"}
${input.musicUrl ? `Music URL: ${input.musicUrl}` : "Music URL: MUSIC_PLACEHOLDER"}

Create an engaging motion graphics video configuration. Return ONLY valid JSON matching the VideoConfig schema, no additional text.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: `${VIZMO_SYSTEM_PROMPT}\n\n${VIDEO_CONFIG_GENERATION_PROMPT}`,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  // Extract text content
  const textContent = response.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Parse JSON from response
  let jsonString = textContent.text.trim();

  // Handle markdown code blocks
  if (jsonString.startsWith("```json")) {
    jsonString = jsonString.slice(7);
  } else if (jsonString.startsWith("```")) {
    jsonString = jsonString.slice(3);
  }
  if (jsonString.endsWith("```")) {
    jsonString = jsonString.slice(0, -3);
  }
  jsonString = jsonString.trim();

  try {
    const parsed = JSON.parse(jsonString);

    // Ensure resolution is set
    if (!parsed.resolution) {
      parsed.resolution = resolution;
    }

    // Ensure fps is set
    if (!parsed.fps) {
      parsed.fps = 30;
    }

    return videoConfigSchema.parse(parsed);
  } catch (error) {
    console.error("Failed to parse video config response:", jsonString);
    throw new Error(`Failed to parse video config: ${error}`);
  }
}

// Retry wrapper with validation
export async function generateVideoConfigWithRetry(
  input: VideoConfigInput,
  apiKey?: string,
  maxRetries: number = 2
): Promise<GeneratedVideoConfig> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await generateVideoConfig(input, apiKey);
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed:`, error);

      if (attempt < maxRetries) {
        // Wait a bit before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError || new Error("Failed to generate video config after retries");
}
