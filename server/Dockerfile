# Optimized multi-stage build for NestJS production image
# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies including Playwright dependencies
# Also install chromium from apk (system package)
RUN apk add --no-cache git python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev pixman-dev chromium

# Copy package files
COPY package.json yarn.lock ./

# Configure yarn for better network stability
RUN yarn config set network-timeout 600000

# Install all dependencies (including dev)
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Skip Playwright browser download (use system chromium)
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
# Verify chromium installation
RUN which chromium-browser || which chromium || echo "chromium not found in PATH"

# Prune dev dependencies for production
RUN yarn install --frozen-lockfile --production=true

# Stage 2: Production runtime
FROM node:22-alpine

WORKDIR /app

# Install runtime dependencies for Playwright + system chromium
RUN apk add --no-cache dumb-init cairo jpeg pango giflib pixman chromium

# Verify chromium is installed and create symlink if needed
RUN which chromium-browser || ln -s /usr/bin/chromium /usr/bin/chromium-browser

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files and production dependencies from builder
COPY --from=builder --chown=nodejs:nodejs /app/package.json /app/yarn.lock ./
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
# Also copy src for drizzle-kit migrations
COPY --from=builder --chown=nodejs:nodejs /app/src ./src
COPY --from=builder --chown=nodejs:nodejs /app/drizzle.config.ts ./drizzle.config.ts

# Set environment variables for Playwright to use system chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_BROWSERS_PATH=/dev/null
ENV NODE_ENV=production
ENV CHROMIUM_PATH=/usr/bin/chromium-browser

# Ensure nodejs user can execute chromium
RUN chmod +x /usr/bin/chromium-browser

# Create an empty playwright cache directory for nodejs user
RUN mkdir -p /app/.playwright/chromium && \
    chown -R nodejs:nodejs /app/.playwright

# Switch to non-root user
USER nodejs

# Health check
#HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#    CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/src/main.js"]

EXPOSE 3001
