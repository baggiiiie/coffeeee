# Multi-stage build for Vite React frontend (monorepo-aware)

FROM node:20-alpine AS builder
WORKDIR /workspace

# Copy only what's needed for dependency install with correct structure
COPY packages/shared-types /workspace/packages/shared-types
COPY apps/frontend/package.json apps/frontend/package-lock.json /workspace/apps/frontend/

# Install deps for frontend (resolves file:../../packages/shared-types)
WORKDIR /workspace/apps/frontend
RUN npm ci

# Build-time API base URL (public URL used by browser)
ARG VITE_API_BASE_URL="http://localhost:8080"
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Copy source and build
COPY apps/frontend /workspace/apps/frontend
RUN npm run build


FROM nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html

# Copy built assets
COPY --from=builder /workspace/apps/frontend/dist .

# Minimal SPA config
RUN printf "server {\n  listen 80;\n  server_name _;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri /index.html;\n  }\n}\n" > /etc/nginx/conf.d/default.conf

EXPOSE 80
