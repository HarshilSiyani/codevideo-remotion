import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SCRIPT_SYSTEM_PROMPT = `You are a professional video scriptwriter. Given a user's topic or idea, create an engaging script for a short-form video (15-60 seconds).

Your script should include:
1. A hook that grabs attention in the first 3 seconds
2. Clear, concise main points
3. A memorable conclusion

Format your response as JSON with:
- title: Video title
- duration: Suggested duration in seconds (15-60)
- hook: The opening hook text
- mainPoints: Array of main content points
- conclusion: Closing statement
- voiceoverScript: Full narration script
- suggestedStyle: Visual style recommendation
- targetAudience: Who this video is for`;

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
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
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      system: SCRIPT_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Create a video script for: ${prompt}\n\nRespond with JSON only, no additional text.`,
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

    const script = JSON.parse(jsonString.trim());

    return NextResponse.json(script);
  } catch (error) {
    console.error("Script generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate script" },
      { status: 500 }
    );
  }
}
