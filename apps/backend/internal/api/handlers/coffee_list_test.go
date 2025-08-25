package handlers

import (
    "database/sql"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
    "time"

    "coffeeee/backend/internal/api/middleware"
    "coffeeee/backend/internal/config"

    _ "github.com/mattn/go-sqlite3"
)

func setupListTestDB(t *testing.T) *sql.DB {
    t.Helper()
    db, err := sql.Open("sqlite3", ":memory:")
    if err != nil { t.Fatalf("open db: %v", err) }
    _, err = db.Exec(`
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            password_salt VARCHAR(255) NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE coffees (
            user_id INTEGER NOT NULL,
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255) NOT NULL,
            origin VARCHAR(100),
            roaster VARCHAR(255),
            description TEXT,
            photo_path VARCHAR(500),
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `)
    if err != nil { t.Fatalf("create schema: %v", err) }
    now := time.Now().Format(time.RFC3339)
    _, _ = db.Exec(`INSERT INTO users(id, username, email, password_hash, password_salt, created_at, updated_at) VALUES(1,'u1','u1@example.com','h','s',?,?)`, now, now)
    _, _ = db.Exec(`INSERT INTO users(id, username, email, password_hash, password_salt, created_at, updated_at) VALUES(2,'u2','u2@example.com','h','s',?,?)`, now, now)
    // Seed coffees for different users
    _, _ = db.Exec(`INSERT INTO coffees(user_id, name, origin) VALUES (1,'A','X'),(1,'B','Y'),(2,'C','Z')`)
    return db
}

func TestListForUser_ReturnsOnlyUserCoffees(t *testing.T) {
    db := setupListTestDB(t)
    defer db.Close()
    h := NewCoffeeHandler(db, &config.Config{})

    req := httptest.NewRequest("GET", "/api/v1/coffees", nil)
    req = req.WithContext(middleware.WithAuthenticatedUserID(req.Context(), 1))
    w := httptest.NewRecorder()
    h.ListForUser(w, req)
    if w.Code != http.StatusOK {
        t.Fatalf("expected 200, got %d", w.Code)
    }
    var resp struct{ Coffees []map[string]any `json:"coffees"` }
    if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
        t.Fatalf("invalid json: %v", err)
    }
    if len(resp.Coffees) != 2 {
        t.Fatalf("expected 2 coffees for user 1, got %d", len(resp.Coffees))
    }
}

