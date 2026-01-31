# AWS Setup Guide for Vizmo (Remotion Lambda)

This guide walks you through setting up AWS infrastructure for Remotion Lambda video rendering.

## Prerequisites

- AWS Account
- AWS CLI installed (`brew install awscli` or `npm install -g aws-cli`)
- Node.js 20+

## Step 1: Create an IAM User

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → **Create user**
3. Name: `vizmo-remotion`
4. Click **Next**
5. Select **Attach policies directly**
6. Create a custom policy with the following JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:CreateFunction",
        "lambda:DeleteFunction",
        "lambda:GetFunction",
        "lambda:InvokeFunction",
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration",
        "lambda:GetFunctionConfiguration",
        "lambda:ListFunctions",
        "lambda:TagResource"
      ],
      "Resource": "arn:aws:lambda:*:*:function:remotion-*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:PutBucketAcl",
        "s3:GetBucketLocation",
        "s3:PutBucketPolicy",
        "s3:GetBucketPolicy"
      ],
      "Resource": [
        "arn:aws:s3:::remotion-*",
        "arn:aws:s3:::remotion-*/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:GetRole",
        "iam:PassRole"
      ],
      "Resource": "arn:aws:iam::*:role/remotion-*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:DeleteLogGroup",
        "logs:PutRetentionPolicy"
      ],
      "Resource": "arn:aws:logs:*:*:log-group:/aws/lambda/remotion-*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "servicequotas:GetServiceQuota",
        "servicequotas:ListServiceQuotas"
      ],
      "Resource": "*"
    }
  ]
}
```

7. Name the policy `VizmoRemotionPolicy`
8. Attach it to the user
9. Click **Create user**

## Step 2: Create Access Keys

1. Go to the user you just created
2. Click **Security credentials** tab
3. Click **Create access key**
4. Select **Application running outside AWS**
5. Save the **Access Key ID** and **Secret Access Key**

## Step 3: Configure AWS CLI

```bash
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Default region: us-east-1 (recommended for Remotion)
# Default output format: json
```

## Step 4: Install Remotion Lambda

```bash
# In the packages/remotion directory
cd packages/remotion
npm install @remotion/lambda
```

## Step 5: Deploy Lambda Function

Create a deployment script:

```bash
# packages/remotion/deploy-lambda.ts
import { deployFunction, deploySite } from "@remotion/lambda";

async function deploy() {
  // Deploy the Lambda function
  const { functionName } = await deployFunction({
    region: "us-east-1",
    timeoutInSeconds: 240,
    memorySizeInMb: 2048,
    createCloudWatchLogGroup: true,
  });

  console.log("Function deployed:", functionName);

  // Deploy the Remotion bundle to S3
  const { serveUrl } = await deploySite({
    region: "us-east-1",
    siteName: "vizmo-remotion",
    entryPoint: "./src/index.ts",
  });

  console.log("Site deployed:", serveUrl);
  console.log("\nAdd these to your .env.local:");
  console.log(`REMOTION_LAMBDA_FUNCTION_NAME=${functionName}`);
  console.log(`REMOTION_SERVE_URL=${serveUrl}`);
}

deploy();
```

Run deployment:

```bash
npx ts-node deploy-lambda.ts
```

## Step 6: Update Environment Variables

Add to `apps/web/.env.local`:

```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
REMOTION_LAMBDA_FUNCTION_NAME=remotion-render-xxxx
REMOTION_SERVE_URL=https://remotion-xxxx.s3.us-east-1.amazonaws.com
```

## Step 7: Test Rendering

```bash
# Test Lambda render
npx ts-node -e "
import { renderMediaOnLambda } from '@remotion/lambda/client';

async function test() {
  const result = await renderMediaOnLambda({
    region: 'us-east-1',
    functionName: process.env.REMOTION_LAMBDA_FUNCTION_NAME,
    serveUrl: process.env.REMOTION_SERVE_URL,
    composition: 'DynamicVideo',
    inputProps: {
      config: {
        duration: 5,
        fps: 30,
        scenes: [{
          id: 'test',
          startFrame: 0,
          durationFrames: 150,
          background: { type: 'gradient', colors: ['#1a1a2e', '#16213e'] },
          elements: [{
            type: 'title',
            text: 'Hello Vizmo!',
            animation: 'fade'
          }]
        }]
      }
    },
    codec: 'h264',
  });
  console.log('Render started:', result.renderId);
}

test();
"
```

## Estimated Costs

| Component | Cost |
|-----------|------|
| Lambda (per render) | ~$0.02-0.10 depending on duration |
| S3 Storage | ~$0.023/GB/month |
| S3 Requests | ~$0.0004/1000 requests |
| Data Transfer | First 100GB free, then $0.09/GB |

**Estimated cost per video:** $0.05-0.15 (60 second video)

**Monthly estimate (10,000 videos):** $500-1,500

## Troubleshooting

### Lambda timeout
Increase `timeoutInSeconds` in deployment (max 900 seconds).

### Out of memory
Increase `memorySizeInMb` (max 10240 MB).

### Cold start issues
Enable provisioned concurrency for consistent performance.

### Access denied errors
Check IAM policy has all required permissions.

## Production Checklist

- [ ] Enable CloudWatch alarms for Lambda errors
- [ ] Set up S3 lifecycle policy to delete old renders
- [ ] Configure CORS on S3 bucket for video playback
- [ ] Enable S3 versioning for safety
- [ ] Set up billing alerts in AWS
- [ ] Consider using CloudFront CDN for video delivery
