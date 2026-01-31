import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { SCRIPT_GENERATION_PROMPT } from "./prompts/system";

// Schema for script generation input
export interface ScriptGenerationInput {
  prompt: string;
  duration?: number; // Target duration in seconds (15-60)
  style?: string; // Optional style hint
  format?: "landscape" | "portrait" | "square";
}

// Schema for generated script
export const generatedScriptSchema = z.object({
  title: z.string(),
  duration: z.number().min(15).max(60),
  hook: z.string(),
  mainPoints: z.array(z.string()),
  conclusion: z.string(),
  voiceoverScript: z.string(),
  suggestedStyle: z.string(),
  targetAudience: z.string(),
});

export type GeneratedScript = z.infer<typeof generatedScriptSchema>;

export async function generateScript(
  input: ScriptGenerationInput,
  apiKey?: string
): Promise<GeneratedScript> {
  const client = new Anthropic({
    apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
  });

  const userPrompt = `Create a video script for the following:

Topic/Idea: ${input.prompt}
${input.duration ? `Target Duration: ${input.duration} seconds` : "Duration: 30-45 seconds"}
${input.style ? `Style Preference: ${input.style}` : ""}
${input.format ? `Format: ${input.format}` : "Format: landscape (16:9)"}

Respond with a JSON object only, no additional text.`;

  const response = await client.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 1024,
    system: SCRIPT_GENERATION_PROMPT,
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
    return generatedScriptSchema.parse(parsed);
  } catch (error) {
    console.error("Failed to parse script response:", jsonString);
    throw new Error(`Failed to parse script: ${error}`);
  }
}
