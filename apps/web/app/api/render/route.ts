import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";

// Check if Lambda is configured
const isLambdaConfigured = !!(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.REMOTION_LAMBDA_FUNCTION_NAME &&
  process.env.REMOTION_SERVE_URL
);

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

    // Use Remotion Lambda if configured
    if (isLambdaConfigured) {
      return await renderWithLambda(renderId, config);
    }

    // Fallback: Save config for local rendering
    return await saveForLocalRender(renderId, config);

  } catch (error) {
    console.error("Render error:", error);
    return NextResponse.json(
      { error: "Failed to render video" },
      { status: 500 }
    );
  }
}

async function renderWithLambda(renderId: string, config: unknown) {
  // Dynamic import to avoid loading Lambda SDK when not configured
  const { renderMediaOnLambda } = await import("@remotion/lambda/client");

  const region = (process.env.AWS_REGION || "us-east-1") as "us-east-1";
  const functionName = process.env.REMOTION_LAMBDA_FUNCTION_NAME!;
  const serveUrl = process.env.REMOTION_SERVE_URL!;

  // Start Lambda render
  const { renderId: lambdaRenderId } = await renderMediaOnLambda({
    region,
    functionName,
    serveUrl,
    composition: "DynamicVideo",
    inputProps: { config },
    codec: "h264",
    imageFormat: "jpeg",
    maxRetries: 2,
    privacy: "public",
    downloadBehavior: {
      type: "download",
      fileName: `vizmo-${renderId}.mp4`,
    },
  });

  return NextResponse.json({
    success: true,
    renderId,
    lambdaRenderId,
    status: "processing",
    message: "Video is rendering on AWS Lambda",
  });
}

async function saveForLocalRender(renderId: string, config: unknown) {
  // Save config for local rendering or manual processing
  const outputDir = path.join(process.cwd(), "public", "renders");
  await mkdir(outputDir, { recursive: true });

  const configPath = path.join(outputDir, `${renderId}.json`);
  await writeFile(configPath, JSON.stringify(config, null, 2));

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return NextResponse.json({
    success: true,
    renderId,
    configPath: `/renders/${renderId}.json`,
    status: "saved",
    message: "Config saved. Set up AWS Lambda for production rendering.",
    instructions: "Run: cd packages/remotion && npm run deploy:lambda",
  });
}

// Check render status (for Lambda async rendering)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lambdaRenderId = searchParams.get("lambdaRenderId");

  if (!lambdaRenderId) {
    return NextResponse.json(
      { error: "lambdaRenderId is required" },
      { status: 400 }
    );
  }

  if (!isLambdaConfigured) {
    return NextResponse.json({
      done: true,
      progress: 1,
      message: "Lambda not configured - using local mode",
    });
  }

  const { getRenderProgress } = await import("@remotion/lambda/client");

  const region = (process.env.AWS_REGION || "us-east-1") as "us-east-1";
  const functionName = process.env.REMOTION_LAMBDA_FUNCTION_NAME!;

  const progress = await getRenderProgress({
    renderId: lambdaRenderId,
    region,
    functionName,
    bucketName: null, // Use default bucket
  });

  return NextResponse.json({
    done: progress.done,
    progress: progress.overallProgress,
    outputFile: progress.outputFile,
    errors: progress.errors,
    fatalErrorEncountered: progress.fatalErrorEncountered,
  });
}
