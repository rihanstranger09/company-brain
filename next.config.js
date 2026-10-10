/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['falkordb'],
  experimental: {
    serverComponentsExternalPackages: ['falkordb'],
  },
};

module.exports = nextConfig;
