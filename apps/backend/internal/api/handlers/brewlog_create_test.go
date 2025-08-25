package handlers

import (
    "bytes"
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

func setupBrewLogTestDB(t *testing.T) *sql.DB {
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
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE brew_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            coffee_id INTEGER NOT NULL,
            brew_method VARCHAR(100) NOT NULL,
            coffee_weight REAL,
            water_weight REAL,
            grind_size VARCHAR(50),
            water_temperature REAL,
            brew_time INTEGER,
            tasting_notes TEXT,
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `)
    if err != nil { t.Fatalf("create schema: %v", err) }
    now := time.Now().Format(time.RFC3339)
    _, _ = db.Exec(`INSERT INTO users(id, username, email, password_hash, password_salt, created_at, updated_at) VALUES(1,'u1','u1@example.com','h','s',?,?)`, now, now)
    _, _ = db.Exec(`INSERT INTO users(id, username, email, password_hash, password_salt, created_at, updated_at) VALUES(2,'u2','u2@example.com','h','s',?,?)`, now, now)
    // Seed coffees: coffee 1 owned by user 1, coffee 2 by user 2
    _, _ = db.Exec(`INSERT INTO coffees(id, user_id, name) VALUES (1,1,'A'),(2,2,'B')`)
    return db
}

func TestBrewLogCreate_Success(t *testing.T) {
    db := setupBrewLogTestDB(t)
    defer db.Close()
    h := NewBrewLogHandler(db, &config.Config{})

    payload := map[string]any{
        "coffeeId":  int64(1),
        "brewMethod": "V60",
        "coffeeWeight": 15.0,
        "waterWeight": 250.0,
        "rating": int64(4),
    }
    b, _ := json.Marshal(payload)
    req := httptest.NewRequest("POST", "/api/v1/brewlogs", bytes.NewBuffer(b))
    req = req.WithContext(middleware.WithAuthenticatedUserID(req.Context(), 1))
    w := httptest.NewRecorder()
    h.Create(w, req)
    if w.Code != http.StatusCreated {
        t.Fatalf("expected 201, got %d", w.Code)
    }
    var resp map[string]any
    _ = json.NewDecoder(w.Body).Decode(&resp)
    if resp["id"] == nil || resp["brewMethod"] != "V60" {
        t.Fatalf("unexpected resp: %#v", resp)
    }
}

func TestBrewLogCreate_Validation(t *testing.T) {
    db := setupBrewLogTestDB(t)
    defer db.Close()
    h := NewBrewLogHandler(db, &config.Config{})
    // Missing brewMethod
    req := httptest.NewRequest("POST", "/api/v1/brewlogs", bytes.NewBufferString(`{"coffeeId":1}`))
    req = req.WithContext(middleware.WithAuthenticatedUserID(req.Context(), 1))
    w := httptest.NewRecorder()
    h.Create(w, req)
    if w.Code != http.StatusBadRequest { t.Fatalf("expected 400, got %d", w.Code) }
}

func TestBrewLogCreate_Forbidden_NotOwner(t *testing.T) {
    db := setupBrewLogTestDB(t)
    defer db.Close()
    h := NewBrewLogHandler(db, &config.Config{})
    req := httptest.NewRequest("POST", "/api/v1/brewlogs", bytes.NewBufferString(`{"coffeeId":2,"brewMethod":"V60"}`))
    req = req.WithContext(middleware.WithAuthenticatedUserID(req.Context(), 1))
    w := httptest.NewRecorder()
    h.Create(w, req)
    if w.Code != http.StatusForbidden { t.Fatalf("expected 403, got %d", w.Code) }
}

func TestBrewLogCreate_Unauthorized(t *testing.T) {
    db := setupBrewLogTestDB(t)
    defer db.Close()
    h := NewBrewLogHandler(db, &config.Config{})
    req := httptest.NewRequest("POST", "/api/v1/brewlogs", bytes.NewBufferString(`{"coffeeId":1,"brewMethod":"V60"}`))
    w := httptest.NewRecorder()
    h.Create(w, req)
    if w.Code != http.StatusUnauthorized { t.Fatalf("expected 401, got %d", w.Code) }
}

