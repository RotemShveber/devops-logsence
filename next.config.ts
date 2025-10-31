import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: [
    'dockerode',
    '@kubernetes/client-node',
    'aws-sdk',
  ],
};

export default nextConfig;
