package handlers

import (
    "bytes"
    "database/sql"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
    "time"

    "coffee-companion/backend/internal/api/middleware"
    "coffee-companion/backend/internal/config"

    _ "github.com/mattn/go-sqlite3"
)

func setupCoffeeTestDB(t *testing.T) *sql.DB {
    t.Helper()
    db, err := sql.Open("sqlite3", ":memory:")
    if err != nil { t.Fatalf("open db: %v", err) }
    // minimal schema: users, coffees, user_coffees + triggers
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
        CREATE TRIGGER update_users_updated_at AFTER UPDATE ON users BEGIN
            UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END;

        CREATE TABLE coffees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255) NOT NULL,
            origin VARCHAR(100),
            roaster VARCHAR(255),
            description TEXT,
            photo_path VARCHAR(500),
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TRIGGER update_coffees_updated_at AFTER UPDATE ON coffees BEGIN
            UPDATE coffees SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END;

        CREATE TABLE user_coffees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            coffee_id INTEGER NOT NULL,
            photo_path VARCHAR(500),
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE UNIQUE INDEX idx_user_coffees_unique ON user_coffees(user_id, coffee_id);
    `)
    if err != nil { t.Fatalf("create schema: %v", err) }
    // seed user
    now := time.Now().Format(time.RFC3339)
    _, err = db.Exec(`INSERT INTO users(id, username, email, password_hash, password_salt, created_at, updated_at) VALUES(1,'u','u@example.com','h','s',?,?)`, now, now)
    if err != nil { t.Fatalf("seed user: %v", err) }
    return db
}

func TestCreateForMe_Validation(t *testing.T) {
    db := setupCoffeeTestDB(t)
    defer db.Close()
    h := NewCoffeeHandler(db, &config.Config{})

    req := httptest.NewRequest("POST", "/api/v1/users/me/coffees", bytes.NewBufferString(`{}`))
    req = req.WithContext(middleware.WithAuthenticatedUserID(req.Context(), 1))
    w := httptest.NewRecorder()
    h.CreateForMe(w, req)
    if w.Code != http.StatusBadRequest {
        t.Fatalf("expected 400, got %d", w.Code)
    }
}

func TestCreateForMe_HappyPath(t *testing.T) {
    db := setupCoffeeTestDB(t)
    defer db.Close()
    h := NewCoffeeHandler(db, &config.Config{})

    payload := `{"name":"Ethiopia Yirgacheffe","roaster":"Blue Bottle","origin":"Ethiopia","description":"Floral"}`
    req := httptest.NewRequest("POST", "/api/v1/users/me/coffees", bytes.NewBufferString(payload))
    req = req.WithContext(middleware.WithAuthenticatedUserID(req.Context(), 1))
    w := httptest.NewRecorder()
    h.CreateForMe(w, req)
    if w.Code != http.StatusCreated {
        t.Fatalf("expected 201, got %d", w.Code)
    }
    var resp map[string]any
    if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
        t.Fatalf("invalid json resp: %v", err)
    }
    if resp["id"] == nil || resp["name"] != "Ethiopia Yirgacheffe" {
        t.Fatalf("unexpected response: %#v", resp)
    }
    if _, ok := resp["link"]; !ok {
        t.Fatalf("expected link metadata in response")
    }

    // Idempotent linking: second call should not create duplicate link
    req2 := httptest.NewRequest("POST", "/api/v1/users/me/coffees", bytes.NewBufferString(payload))
    req2 = req2.WithContext(middleware.WithAuthenticatedUserID(req2.Context(), 1))
    w2 := httptest.NewRecorder()
    h.CreateForMe(w2, req2)
    if w2.Code != http.StatusCreated {
        t.Fatalf("expected 201 on second call, got %d", w2.Code)
    }
    // Count links
    var cnt int
    _ = db.QueryRow(`SELECT COUNT(*) FROM user_coffees WHERE user_id=1`).Scan(&cnt)
    if cnt != 1 {
        t.Fatalf("expected 1 link, got %d", cnt)
    }
}

