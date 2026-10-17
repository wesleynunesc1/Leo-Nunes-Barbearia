import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
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
