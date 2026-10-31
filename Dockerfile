# ─── Multi-Stage Production Dockerfile for TripPilot ───
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN cd client && npm install
RUN cd server && npm install

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
ENV PORT=10000

# Copy built server and production node_modules
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/data ./server/data

EXPOSE 10000

CMD ["node", "server/dist/index.js"]

