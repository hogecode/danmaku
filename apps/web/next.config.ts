import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration for Docker hot-reload
  turbopack: {
    resolveAlias: {},
  },

  // Enable experimental features for better hot-reload in containers
  experimental: {
    // Turbopack-specific settings
    turbo: {
      useSwc: true,
    },
  },

  // Enable Fast Refresh and React Strict Mode
  reactStrictMode: true,

  // Optimize on-demand entries for Docker
  onDemandEntries: {
    maxInactiveAge: 30 * 1000, // Shorter timeout
    pagesBufferLength: 10,
  },

  // Webpack configuration for development
  webpack: (config, { isServer }) => {
    if (process.env.CHOKIDAR_USEPOLLING === 'true') {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },
};

export default nextConfig;
