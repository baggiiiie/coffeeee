package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"coffee-companion/backend/internal/config"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Ensure data directory exists
	dataDir := filepath.Dir(cfg.Database.URL)
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		log.Fatalf("Failed to create data directory: %v", err)
	}

	// Open database connection
	db, err := sql.Open("sqlite3", cfg.Database.URL)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// Test connection
	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	// Enable foreign keys
	if _, err := db.Exec("PRAGMA foreign_keys = ON"); err != nil {
		log.Fatalf("Failed to enable foreign keys: %v", err)
	}

	// Enable WAL mode
	if _, err := db.Exec("PRAGMA journal_mode = WAL"); err != nil {
		log.Fatalf("Failed to enable WAL mode: %v", err)
	}

	// Read and execute migration
	migrationPath := filepath.Join(cfg.Database.MigrationsPath, "001_initial_schema.sql")
	migrationSQL, err := os.ReadFile(migrationPath)
	if err != nil {
		log.Fatalf("Failed to read migration file: %v", err)
	}

	// Execute migration
	if _, err := db.Exec(string(migrationSQL)); err != nil {
		log.Fatalf("Failed to execute migration: %v", err)
	}

	fmt.Printf("Database setup completed successfully!\n")
	fmt.Printf("Database file: %s\n", cfg.Database.URL)
}
