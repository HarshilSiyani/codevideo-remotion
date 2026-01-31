import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const VIDEO_CONFIG_SYSTEM_PROMPT = `You are Vizmo, an expert AI video creator. Create engaging, professional motion graphics videos.

Given a script, create a complete video configuration JSON. Your videos should be visually dynamic with scene changes every 3-8 seconds.

Available components:

BACKGROUNDS:
- solid: { type: "solid", color: "#000000" }
- gradient: { type: "gradient", colors: ["#667eea", "#764ba2"], animated: true }
- particles: { type: "particles", color: "#ffffff", density: "medium", backgroundColor: "#0a0a0a" }
- grid: { type: "grid", color: "#00ff88", backgroundColor: "#0a0a0a", animated: true }

TEXT ELEMENTS:
- title: { type: "title", text: "...", fontSize: 80, color: "#ffffff", position: "center" }
- glitch: { type: "glitch", text: "...", fontSize: 72, color: "#ff0040" }
- typewriter: { type: "typewriter", text: "...", fontSize: 48, color: "#00ff88" }
- kinetic: { type: "kinetic", text: "...", fontSize: 64, color: "#ffffff", style: "bounce" }
- fade: { type: "fade", text: "...", fontSize: 48, color: "#ffffff" }

TRANSITIONS:
- fade: { type: "fade", duration: 0.5 }
- glitch: { type: "glitch", duration: 0.3 }
- zoom: { type: "zoom", duration: 0.5 }
- wipe: { type: "wipe", duration: 0.5 }

Return a VideoConfig JSON:
{
  "title": string,
  "duration": number,
  "fps": 30,
  "resolution": { "width": 1920, "height": 1080 },
  "scenes": [
    {
      "id": string,
      "startTime": number,
      "duration": number,
      "background": BackgroundConfig,
      "elements": ElementConfig[],
      "transition": TransitionConfig
    }
  ],
  "audio": {
    "voiceover": { "url": "VOICEOVER_PLACEHOLDER", "volume": 1 },
    "music": { "url": "MUSIC_PLACEHOLDER", "volume": 0.3 }
  }
}`;

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
          content: `Create a Remotion video config for this script:

Title: ${script.title}
Duration: ${script.duration} seconds
Hook: ${script.hook}
Main Points: ${script.mainPoints?.join(", ")}
Conclusion: ${script.conclusion}
Voiceover: ${script.voiceoverScript}
Style: ${script.suggestedStyle}

Return ONLY valid JSON, no additional text.`,
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No response from AI");
    }

    let jsonString = textContent.text.trim();
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

    return NextResponse.json(config);
  } catch (error) {
    console.error("Config generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate video configuration" },
      { status: 500 }
    );
  }
}
