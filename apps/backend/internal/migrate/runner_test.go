package migrate

import (
	"database/sql"
	"os"
	"path/filepath"
	"testing"

	"coffeeee/backend/internal/database"

	_ "github.com/mattn/go-sqlite3"
)

func TestMigrateUpAndDownUsers(t *testing.T) {
	tmp := t.TempDir()
	dbPath := filepath.Join(tmp, "test.db")

	db, err := database.Connect(dbPath)
	if err != nil {
		t.Fatalf("failed to init db: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })

	migrationsDir := filepath.Clean(filepath.Join("..", "..", "migrations"))

	// Up to latest
	if err := ApplyUpToLatest(db, migrationsDir); err != nil {
		t.Fatalf("migrate up failed: %v", err)
	}

	// Verify users table exists
	if !tableExists(t, db, "users") {
		t.Fatalf("expected users table to exist after up")
	}

	// Down one (revert latest migration only)
	if err := ApplyDownOne(db, migrationsDir); err != nil {
		t.Fatalf("migrate down failed: %v", err)
	}
	// Assert outcome based on how many migrations exist
	migs, err := DiscoverMigrations(migrationsDir)
	if err != nil {
		t.Fatalf("discover migrations failed: %v", err)
	}
	if len(migs) >= 2 {
		// With multiple migrations, reverting latest should leave base tables (e.g., users)
		if !tableExists(t, db, "users") {
			t.Fatalf("expected users table to remain after reverting only latest migration")
		}
	} else {
		// With a single migration, reverting latest may drop users
		if tableExists(t, db, "users") {
			t.Fatalf("expected users table to be dropped after reverting the only migration")
		}
	}
}

func tableExists(t *testing.T, db *sql.DB, name string) bool {
	t.Helper()
	var n int
	err := db.QueryRow("SELECT COUNT(1) FROM sqlite_master WHERE type='table' AND name=?", name).Scan(&n)
	if err != nil {
		t.Fatalf("failed to query sqlite_master: %v", err)
	}
	return n > 0
}

func TestSchemaMigrationsTracking(t *testing.T) {
	tmp := t.TempDir()
	dbPath := filepath.Join(tmp, "test2.db")

	db, err := database.Connect(dbPath)
	if err != nil {
		t.Fatalf("failed to init db: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })

	if err := EnsureSchemaMigrations(db); err != nil {
		t.Fatalf("ensure schema_migrations failed: %v", err)
	}

	// Verify table exists
	if !tableExists(t, db, "schema_migrations") {
		b, _ := os.ReadFile(dbPath)
		_ = b // noop, just to keep linter calm if needed
		t.Fatalf("expected schema_migrations table to exist")
	}
}
