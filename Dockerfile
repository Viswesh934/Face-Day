# Dockerfile for Face Day Presage SmartSpectra Backend
# Optimized for AWS App Runner & Docker Deployments
FROM node:20-bookworm-slim

# Install system dependencies required by libsmartspectra.so native C++ binaries
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package definition
COPY server/package.json ./

# Install production dependencies (@smartspectra/node-sdk and ws)
RUN npm install --omit=dev

# Copy server entrypoint
COPY server/index.mjs ./

# AWS App Runner configures PORT (defaults to 8080)
ENV PORT=8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 8080) + '/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "index.mjs"]
