# Multi-stage production Dockerfile for FynDry Backend API
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install curl for container health check
RUN apk add --no-cache curl

# Run as non-root user for container security
USER node

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node src ./src
COPY --chown=node:node public ./public

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5001/api/health || exit 1

CMD ["node", "src/server.js"]
