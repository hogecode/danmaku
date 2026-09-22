# Optimized multi-stage build for NestJS production image
# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

# Install git (needed for GitHub package installation)
RUN apk add --no-cache git

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

# Prune dev dependencies for production
RUN yarn install --frozen-lockfile --production=true

# Stage 2: Production runtime
FROM node:22-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

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
