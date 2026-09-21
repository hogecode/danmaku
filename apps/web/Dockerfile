# Optimized multi-stage build for Next.js production image
# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install git (needed for GitHub package installation)
RUN apk add --no-cache git

# Copy package files
COPY package.json package-lock.json ./

# Configure npm for better network stability
RUN npm config set fetch-timeout 600000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Install all dependencies (including dev)
# Using npm ci for more reliable installation with lock file
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Set environment variables for build
# ECSタスク定義だと、ビルド後なのでも環境変数をここで設定する必要がある
ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_API_BASE_URL=https://danmaku.cloud
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

ARG NEXT_PUBLIC_API_URL=https://danmaku.cloud/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

ARG NEXT_PUBLIC_APP_NAME=Danmaku
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}

ARG NEXT_PUBLIC_LOG_LEVEL=debug
ENV NEXT_PUBLIC_LOG_LEVEL=${NEXT_PUBLIC_LOG_LEVEL}

# Build the application
RUN npm run build --legacy-peer-deps

# Prune dev dependencies for production
RUN npm prune --omit=dev --legacy-peer-deps

# Stage 2: Production runtime
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files and production dependencies from builder
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/.next ./.next
COPY --from=builder --chown=nodejs:nodejs /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/next.config.* ./

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]

EXPOSE 3000
