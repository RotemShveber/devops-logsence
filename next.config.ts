import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone', // Enable standalone output for Docker
  serverExternalPackages: [
    'dockerode',
    '@kubernetes/client-node',
    'aws-sdk',
  ],
};

export default nextConfig;
