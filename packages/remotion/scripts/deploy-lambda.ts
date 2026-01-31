/**
 * Deploy Remotion Lambda function and site to AWS
 *
 * Run with: npx ts-node scripts/deploy-lambda.ts
 */

import { deployFunction, deploySite, getRegions } from "@remotion/lambda";
import path from "path";

const REGION = (process.env.AWS_REGION || "us-east-1") as ReturnType<typeof getRegions>[number];

async function deploy() {
  console.log("🚀 Deploying Remotion Lambda to", REGION);
  console.log("");

  try {
    // Step 1: Deploy Lambda function
    console.log("📦 Deploying Lambda function...");
    const { functionName, alreadyExisted } = await deployFunction({
      region: REGION,
      timeoutInSeconds: 240,
      memorySizeInMb: 2048,
      createCloudWatchLogGroup: true,
      diskSizeInMb: 2048,
    });

    console.log(alreadyExisted ? "✅ Function already exists:" : "✅ Function deployed:", functionName);
    console.log("");

    // Step 2: Deploy site bundle to S3
    console.log("📦 Deploying Remotion bundle to S3...");
    const { serveUrl } = await deploySite({
      region: REGION,
      siteName: "vizmo-remotion",
      entryPoint: path.join(__dirname, "../src/index.ts"),
    });

    console.log("✅ Site deployed:", serveUrl);
    console.log("");

    // Output environment variables
    console.log("═".repeat(50));
    console.log("Add these to your apps/web/.env.local:");
    console.log("═".repeat(50));
    console.log("");
    console.log(`REMOTION_LAMBDA_FUNCTION_NAME=${functionName}`);
    console.log(`REMOTION_SERVE_URL=${serveUrl}`);
    console.log(`AWS_REGION=${REGION}`);
    console.log("");
    console.log("═".repeat(50));

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

deploy();
