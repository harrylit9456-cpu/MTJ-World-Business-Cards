import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
  },
  allowedDevOrigins: ["192.168.1.12"],
};

export default nextConfig;
