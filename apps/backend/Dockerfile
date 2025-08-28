# Multi-stage build for Go backend (uses SQLite, so CGO enabled)

FROM golang:1.22-alpine AS builder
WORKDIR /app

# Install build dependencies for CGO (required by github.com/mattn/go-sqlite3)
RUN apk add --no-cache build-base

# Cache go modules first
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source
COPY . .

# Build the server binary
RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build -o server ./cmd/server/main.go


FROM alpine:3.20 AS runtime
WORKDIR /app

# Runtime dependencies
RUN apk add --no-cache ca-certificates sqlite-libs tzdata

# Create a non-root user
RUN addgroup -S app && adduser -S app -G app

# Copy binary and migrations
COPY --from=builder /app/server /app/server
COPY --from=builder /app/migrations /migrations

# Data directory (mounted as a volume via compose)
VOLUME ["/data"]

# Default environment
ENV PORT=8080 \
    HOST=0.0.0.0 \
    DATABASE_URL=/data/coffee.db \
    DATABASE_MIGRATIONS_PATH=/migrations \
    ENV=production

EXPOSE 8080

USER app

CMD ["/app/server"]


