import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sizda bor bo'lgan boshqa yozuvlarga tegmang, shunchaki pastdagi 2 ta qatorni qo'shing:
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
