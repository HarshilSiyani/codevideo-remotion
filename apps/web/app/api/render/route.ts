import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import { spawn } from "child_process";

// Store for tracking render progress
const renderProgress = new Map<string, { progress: number; done: boolean; error?: string; outputFile?: string }>();

export async function POST(request: NextRequest) {
  try {
    const { config } = await request.json();

    if (!config) {
      return NextResponse.json(
        { error: "Video configuration is required" },
        { status: 400 }
      );
    }

    const renderId = randomUUID();

    // Use local rendering
    const result = await renderLocally(renderId, config);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Render error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to render video" },
      { status: 500 }
    );
  }
}

async function renderLocally(renderId: string, config: unknown) {
  const outputDir = path.join(process.cwd(), "public", "renders");
  await mkdir(outputDir, { recursive: true });

  // Save config as props file
  const propsPath = path.join(outputDir, `${renderId}-props.json`);
  await writeFile(propsPath, JSON.stringify({ config }, null, 2));

  const outputPath = path.join(outputDir, `${renderId}.mp4`);
  const videoUrl = `/renders/${renderId}.mp4`;

  // Initialize progress tracking
  renderProgress.set(renderId, { progress: 0, done: false });

  // Get the remotion package path
  const remotionPath = path.join(process.cwd(), "..", "..", "packages", "remotion");

  // Spawn Remotion render process
  const renderProcess = spawn("npx", [
    "remotion",
    "render",
    "DynamicVideo",
    outputPath,
    "--props", propsPath,
    "--log", "verbose"
  ], {
    cwd: remotionPath,
    env: { ...process.env },
  });

  // Track progress from stdout
  renderProcess.stdout.on("data", (data: Buffer) => {
    const output = data.toString();
    console.log("[Remotion]", output);

    // Parse progress from Remotion output
    const progressMatch = output.match(/(\d+)%/);
    if (progressMatch) {
      const progress = parseInt(progressMatch[1], 10) / 100;
      renderProgress.set(renderId, { progress, done: false });
    }
  });

  renderProcess.stderr.on("data", (data: Buffer) => {
    console.error("[Remotion Error]", data.toString());
  });

  // Handle completion
  renderProcess.on("close", (code) => {
    if (code === 0) {
      renderProgress.set(renderId, { progress: 1, done: true, outputFile: videoUrl });
      console.log(`[Remotion] Render complete: ${videoUrl}`);
    } else {
      renderProgress.set(renderId, {
        progress: 0,
        done: true,
        error: `Render failed with exit code ${code}`
      });
    }
  });

  return {
    success: true,
    renderId,
    videoUrl,
    status: "processing",
    message: "Video is rendering locally",
  };
}

// Check render status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const renderId = searchParams.get("renderId");

  if (!renderId) {
    return NextResponse.json(
      { error: "renderId is required" },
      { status: 400 }
    );
  }

  const status = renderProgress.get(renderId);

  if (!status) {
    return NextResponse.json({
      done: false,
      progress: 0,
      message: "Render not found or not started",
    });
  }

  return NextResponse.json({
    done: status.done,
    progress: status.progress,
    outputFile: status.outputFile,
    error: status.error,
  });
}
