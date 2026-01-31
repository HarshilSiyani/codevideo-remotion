import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";

// ElevenLabs voice IDs
const VOICES = {
  rachel: "21m00Tcm4TlvDq8ikWAM", // Rachel - calm, professional
  domi: "AZnzlk1XvdvUeBnXmlld", // Domi - strong, confident
  bella: "EXAVITQu4vr4xnSDxMaL", // Bella - soft, natural
  antoni: "ErXwobaYiN019PkySvjV", // Antoni - well-rounded, warm
  josh: "TxGEqnHWrfWFTfGW9XjX", // Josh - deep, narrative
  arnold: "VR6AewLTigWG4xSOukaG", // Arnold - crisp, American
  adam: "pNInz6obpgDQGcFmaJgB", // Adam - deep, narration
  sam: "yoZ06aMxZJJ28mfd3POQ", // Sam - raspy, young
} as const;

type VoiceId = keyof typeof VOICES;

interface VoiceoverRequest {
  text: string;
  voice?: VoiceId;
  stability?: number;
  similarityBoost?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: VoiceoverRequest = await request.json();
    const { text, voice = "josh", stability = 0.5, similarityBoost = 0.75 } = body;

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      // For development without API key, return a placeholder
      return NextResponse.json({
        success: true,
        audioUrl: "/audio/placeholder-voiceover.mp3",
        message: "Placeholder audio - ElevenLabs API key not configured",
      });
    }

    const voiceId = VOICES[voice] || VOICES.josh;

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("ElevenLabs API error:", error);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer();

    // Save to public folder
    const audioId = randomUUID();
    const outputDir = path.join(process.cwd(), "public", "audio");
    await mkdir(outputDir, { recursive: true });

    const audioPath = path.join(outputDir, `${audioId}.mp3`);
    await writeFile(audioPath, Buffer.from(audioBuffer));

    const audioUrl = `/audio/${audioId}.mp3`;

    return NextResponse.json({
      success: true,
      audioId,
      audioUrl,
      duration: estimateAudioDuration(text),
    });
  } catch (error) {
    console.error("Voiceover generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate voiceover" },
      { status: 500 }
    );
  }
}

// Rough estimate of audio duration based on word count
// Average speaking rate is ~150 words per minute
function estimateAudioDuration(text: string): number {
  const wordCount = text.split(/\s+/).length;
  const wordsPerSecond = 150 / 60; // 2.5 words per second
  return Math.ceil(wordCount / wordsPerSecond);
}

// Get available voices
export async function GET() {
  return NextResponse.json({
    voices: Object.entries(VOICES).map(([name, id]) => ({
      name,
      id,
      description: getVoiceDescription(name as VoiceId),
    })),
  });
}

function getVoiceDescription(voice: VoiceId): string {
  const descriptions: Record<VoiceId, string> = {
    rachel: "Calm, professional female voice",
    domi: "Strong, confident female voice",
    bella: "Soft, natural female voice",
    antoni: "Well-rounded, warm male voice",
    josh: "Deep, narrative male voice",
    arnold: "Crisp, American male voice",
    adam: "Deep, narration male voice",
    sam: "Raspy, young male voice",
  };
  return descriptions[voice];
}
