import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const VIDEO_CONFIG_SYSTEM_PROMPT = `You are a video configuration generator. Create configs for Remotion motion graphics videos.

## CRITICAL RULES - READ CAREFULLY

1. **ONE TEXT ELEMENT PER SCENE** - Each scene must have exactly ONE text element. Never put multiple text elements in the same scene - they will overlap and look bad.

2. **SCENES ARE SEQUENTIAL** - Do NOT use startTime. Scenes play one after another automatically.

3. **SHORT SCENES** - Each scene should be 3-5 seconds max.

4. **SIMPLE STRUCTURE** - Keep it clean: one background + one text per scene.

## SCHEMA

{
  "title": "Video Title",
  "duration": 30,
  "fps": 30,
  "scenes": [
    {
      "id": "scene-1",
      "duration": 4,
      "background": { "type": "gradient", "colors": ["#1a1a2e", "#16213e"], "animated": true },
      "elements": [
        { "type": "title", "text": "One Text Only", "fontSize": 72, "color": "#ffffff", "position": "center" }
      ],
      "transition": "fade"
    }
  ]
}

## BACKGROUNDS

{ "type": "solid", "color": "#0a0a0a" }
{ "type": "gradient", "colors": ["#667eea", "#764ba2"], "animated": true }
{ "type": "particles", "color": "#ffffff", "density": "low", "backgroundColor": "#0a0a0a" }
{ "type": "grid", "color": "#00ff88", "backgroundColor": "#0a0a0a", "animated": true }

## TEXT ELEMENTS (use only ONE per scene)

{ "type": "title", "text": "Big Title", "fontSize": 72, "color": "#ffffff", "position": "center" }
{ "type": "fade", "text": "Simple text", "fontSize": 48, "color": "#ffffff", "position": "center" }
{ "type": "typewriter", "text": "Typing...", "fontSize": 42, "color": "#ffffff", "position": "center" }
{ "type": "kinetic", "text": "BOOM", "fontSize": 64, "color": "#ffffff", "style": "slam", "position": "center" }
{ "type": "glitch", "text": "ERROR", "fontSize": 72, "color": "#ff0040", "position": "center" }

Kinetic styles: "bounce", "wave", "pop", "slam"
Positions: "top", "center", "bottom"

## TRANSITIONS

"fade" | "slide" | "wipe" | "none"

## EXAMPLE - 20 SECOND VIDEO WITH 5 SCENES

{
  "title": "Why Is The Sky Blue",
  "duration": 20,
  "fps": 30,
  "scenes": [
    {
      "id": "scene-1",
      "duration": 4,
      "background": { "type": "gradient", "colors": ["#0f0c29", "#302b63"], "animated": true },
      "elements": [
        { "type": "title", "text": "Ever wondered...", "fontSize": 72, "color": "#ffffff", "position": "center" }
      ],
      "transition": "fade"
    },
    {
      "id": "scene-2",
      "duration": 4,
      "background": { "type": "gradient", "colors": ["#00b4db", "#0083b0"], "animated": true },
      "elements": [
        { "type": "kinetic", "text": "Why is the sky BLUE?", "fontSize": 64, "color": "#ffffff", "style": "pop", "position": "center" }
      ],
      "transition": "slide"
    },
    {
      "id": "scene-3",
      "duration": 5,
      "background": { "type": "particles", "color": "#4cc9f0", "density": "low", "backgroundColor": "#0a0a0a" },
      "elements": [
        { "type": "fade", "text": "Sunlight scatters through our atmosphere", "fontSize": 48, "color": "#ffffff", "position": "center" }
      ],
      "transition": "fade"
    },
    {
      "id": "scene-4",
      "duration": 4,
      "background": { "type": "solid", "color": "#0077b6" },
      "elements": [
        { "type": "title", "text": "Blue light scatters most!", "fontSize": 56, "color": "#ffffff", "position": "center" }
      ],
      "transition": "wipe"
    },
    {
      "id": "scene-5",
      "duration": 3,
      "background": { "type": "gradient", "colors": ["#7209b7", "#3a0ca3"], "animated": true },
      "elements": [
        { "type": "glitch", "text": "SCIENCE!", "fontSize": 96, "color": "#ffffff", "position": "center" }
      ],
      "transition": "none"
    }
  ]
}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, no code blocks. Just the JSON object.`;

export async function POST(request: NextRequest) {
  try {
    const { script } = await request.json();

    if (!script) {
      return NextResponse.json(
        { error: "Script is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: VIDEO_CONFIG_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Create a video config for this script. Remember: ONE text element per scene only!

Title: ${script.title}
Duration: ${script.duration} seconds
Hook: ${script.hook}
Main Points: ${script.mainPoints?.join(" | ")}
Conclusion: ${script.conclusion}
Style: ${script.suggestedStyle || "professional"}

Create ${Math.max(4, Math.ceil(script.duration / 5))} scenes, each with exactly ONE text element.
Return ONLY the JSON object, nothing else.`,
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No response from AI");
    }

    let jsonString = textContent.text.trim();

    // Remove markdown code blocks if present
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.slice(7);
    } else if (jsonString.startsWith("```")) {
      jsonString = jsonString.slice(3);
    }
    if (jsonString.endsWith("```")) {
      jsonString = jsonString.slice(0, -3);
    }

    const config = JSON.parse(jsonString.trim());

    // Ensure required fields
    if (!config.fps) config.fps = 30;
    if (!config.resolution) config.resolution = { width: 1920, height: 1080 };

    // Validate: ensure each scene has only one text element
    if (config.scenes) {
      config.scenes = config.scenes.map((scene: any) => {
        if (scene.elements && scene.elements.length > 1) {
          // Keep only the first text element
          scene.elements = [scene.elements[0]];
        }
        // Remove startTime if present (we use sequential scenes now)
        delete scene.startTime;
        return scene;
      });
    }

    console.log("Generated config:", JSON.stringify(config, null, 2));

    return NextResponse.json(config);
  } catch (error) {
    console.error("Config generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate video configuration" },
      { status: 500 }
    );
  }
}
