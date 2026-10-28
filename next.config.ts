import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 390, 430, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      {
        source: "/selecionar-barbeiro",
        destination: "/agendar",
        permanent: true,
      },
      {
        source: "/selecionar-barbeiro/",
        destination: "/agendar",
        permanent: true,
      },
      {
        source: "/leonunesagenda",
        destination: "/agendar/leo-nunes",
        permanent: true,
      },
      {
        source: "/leonunesagenda/",
        destination: "/agendar/leo-nunes",
        permanent: true,
      },
      {
        source: "/aleffernunesagenda",
        destination: "/agendar/aleffer-nunes",
        permanent: true,
      },
      {
        source: "/aleffernunesagenda/",
        destination: "/agendar/aleffer-nunes",
        permanent: true,
      },
      {
        source: "/heliovictoragenda",
        destination: "/agendar/helio-victor",
        permanent: true,
      },
      {
        source: "/heliovictoragenda/",
        destination: "/agendar/helio-victor",
        permanent: true,
      },
      {
        source: "/guilhermeagenda",
        destination: "/agendar/guilherme-oliveira",
        permanent: true,
      },
      {
        source: "/guilhermeagenda/",
        destination: "/agendar/guilherme-oliveira",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
