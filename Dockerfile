# ─── Multi-Stage Production Dockerfile for TripPilot ───
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN cd client && npm ci
RUN cd server && npm ci

# Copy full source
COPY client/ ./client/
COPY server/ ./server/

# Build client and server
RUN cd client && npm run build
RUN cd server && npm run build

# ─── Production Runner ───
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Copy built server and production node_modules
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

# Expose data directory for persistent volume mount
VOLUME ["/app/server/data"]

EXPOSE 3001

CMD ["node", "server/dist/index.js"]

