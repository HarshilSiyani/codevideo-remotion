/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@vizmo/ai", "@vizmo/remotion"],
  experimental: {
    serverComponentsExternalPackages: ["@anthropic-ai/sdk"],
  },
};

module.exports = nextConfig;
