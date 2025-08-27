.PHONY: help install dev backend frontend test clean db-setup

# Default target
help:
	@echo "Coffee Companion - Development Commands"
	@echo "======================================"
	@echo "install     - Install all dependencies"
	@echo "dev         - Start both backend and frontend in development mode"
	@echo "backend     - Start backend server only"
	@echo "frontend    - Start frontend development server only"
	@echo "test        - Run all tests"
	@echo "clean       - Clean build artifacts"
	@echo "db-setup    - Setup database (legacy one-off)"
	@echo "db-migrate-up   - Apply all pending DB migrations"
	@echo "db-migrate-down - Revert the latest DB migration"
	@echo "sqlc-generate   - Generate sqlc code from SQL queries"

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install
	cd apps/backend && go mod tidy
	cd apps/backend && go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
	cd apps/backend && sqlc generate

# Start both servers
dev:
	@echo "Starting development servers..."
	@echo "Backend: http://localhost:8080"
	@echo "Frontend: http://localhost:3000"
	@echo "Press Ctrl+C to stop both servers"
	@trap 'kill %1; kill %2' SIGINT; \
	cd apps/backend && go run cmd/server/main.go & \
	cd apps/frontend && npm run dev & \
	wait

# Start backend only
backend:
	@echo "Starting backend server..."
	@echo "Backend: http://localhost:8080"
	cd apps/backend && go run cmd/server/main.go

# Start frontend only
frontend:
	@echo "Starting frontend development server..."
	@echo "Frontend: http://localhost:3000"
	cd apps/frontend && npm run dev

# Run tests
test:
	@echo "Running tests..."
	cd apps/backend && go test ./...
	cd apps/frontend && npm test

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf apps/frontend/dist
	rm -rf apps/frontend/node_modules/.vite
	rm -f apps/backend/coffeeee
	rm -f apps/backend/data/coffee.db

# Setup database
db-setup:
	@echo "Setting up database..."
	cd apps/backend && go run cmd/setup/main.go

# Migration commands
db-migrate-up:
	@echo "Applying database migrations..."
	cd apps/backend && go run cmd/migrate/main.go up

db-migrate-down:
	@echo "Reverting latest database migration..."
	cd apps/backend && go run cmd/migrate/main.go down

# Generate sqlc code
sqlc-generate:
	@echo "Generating sqlc code..."
	cd apps/backend && sqlc generate

# Build for production
build:
	@echo "Building for production..."
	cd apps/frontend && npm run build
	cd apps/backend && go build -o coffeeee cmd/server/main.go
