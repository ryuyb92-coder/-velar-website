import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // App Router is default in Next.js 16
  // Image optimization for vehicle renders and hero imagery
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
