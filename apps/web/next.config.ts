import type { NextConfig } from "next";

let nextConfig: NextConfig = {
  // Turbopack configuration for Docker hot-reload
  turbopack: {
    resolveAlias: {},
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

// Sentry設定（オプション - インストールされている場合のみ）
try {
  const { withSentryConfig } = require("@sentry/nextjs");
  nextConfig = withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    sentryUrl: process.env.SENTRY_URL,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    silent: false,
    hideSourceMaps: true,
  });
} catch (error) {
  // @sentry/nextjs がインストールされていない場合はスキップ
  console.warn("⚠️ Sentry not configured (optional)");
}

export default nextConfig;
