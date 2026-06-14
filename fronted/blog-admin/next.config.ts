import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 为 @imgly/background-removal 的 SharedArrayBuffer 提供所需的安全头
  // （非必须，但可提升 WASM 性能）
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
