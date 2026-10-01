import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

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

nextConfig = withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  sentryUrl: process.env.SENTRY_URL,

  // An auth token is required for uploading source maps.
  authToken: process.env.SENTRY_AUTH_TOKEN,

  silent: false, // Can be used to suppress all Sentry CLI output
  
  // Hides source maps from generated client bundles
  hideSourceMaps: true,
});

export default nextConfig;
