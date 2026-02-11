import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ['@xenova/transformers'],
  turbopack: {
    resolveAlias: {
      'sharp': { browser: '' },
      'onnxruntime-node': { browser: '' },
    },
  },
};

export default nextConfig;
