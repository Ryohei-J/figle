import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Googleの画像サーバー
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
