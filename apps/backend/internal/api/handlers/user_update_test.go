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
)

func setupTestDB(t *testing.T) *sql.DB {
    t.Helper()
    db, err := sql.Open("sqlite3", ":memory:")
    if err != nil {
        t.Fatalf("Failed to open test database: %v", err)
    }
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
        CREATE TRIGGER update_users_updated_at 
            AFTER UPDATE ON users
            BEGIN
                UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END;
    `)
    if err != nil {
        t.Fatalf("Failed to create schema: %v", err)
    }
    return db
}

func insertUser(t *testing.T, db *sql.DB, id int64, username, email string) {
    t.Helper()
    now := time.Now().Format(time.RFC3339)
    _, err := db.Exec(`
        INSERT INTO users (id, username, email, password_hash, password_salt, created_at, updated_at)
        VALUES (?, ?, ?, 'hash', 'salt', ?, ?)
    `, id, username, email, now, now)
    if err != nil {
        t.Fatalf("Failed to insert user: %v", err)
    }
}

func TestUserHandler_UpdateProfile(t *testing.T) {
    db := setupTestDB(t)
    defer db.Close()

    // Seed users
    insertUser(t, db, 1, "alice", "alice@example.com")
    insertUser(t, db, 2, "bob", "bob@example.com")

    cfg := &config.Config{}
    handler := NewUserHandler(db, cfg)

    t.Run("unauthorized when no context", func(t *testing.T) {
        req := httptest.NewRequest("PUT", "/api/v1/users/me", bytes.NewBufferString(`{"username":"newalice"}`))
        w := httptest.NewRecorder()
        handler.UpdateProfile(w, req)
        if w.Code != http.StatusUnauthorized {
            t.Fatalf("expected 401, got %d", w.Code)
        }
        if ct := w.Header().Get("Content-Type"); ct != "application/json; charset=utf-8" {
            t.Fatalf("unexpected content type: %s", ct)
        }
    })

    t.Run("bad request when empty body", func(t *testing.T) {
        req := httptest.NewRequest("PUT", "/api/v1/users/me", bytes.NewBufferString(`{}`))
        req = req.WithContext(middleware.WithAuthenticatedUserID(req.Context(), 1))
        w := httptest.NewRecorder()
        handler.UpdateProfile(w, req)
        if w.Code != http.StatusBadRequest {
            t.Fatalf("expected 400, got %d", w.Code)
        }
        var resp map[string]any
        _ = json.NewDecoder(w.Body).Decode(&resp)
        if resp["message"] != "At least one field must be provided" {
            t.Fatalf("unexpected message: %v", resp["message"])
        }
    })

    t.Run("invalid email format", func(t *testing.T) {
        req := httptest.NewRequest("PUT", "/api/v1/users/me", bytes.NewBufferString(`{"email":"invalid"}`))
        req = req.WithContext(middleware.WithAuthenticatedUserID(req.Context(), 1))
        w := httptest.NewRecorder()
        handler.UpdateProfile(w, req)
        if w.Code != http.StatusBadRequest {
            t.Fatalf("expected 400, got %d", w.Code)
        }
        var resp map[string]any
        _ = json.NewDecoder(w.Body).Decode(&resp)
        if resp["message"] != "Email format is invalid" {
            t.Fatalf("unexpected message: %v", resp["message"])
        }
    })

    t.Run("email conflict", func(t *testing.T) {
        req := httptest.NewRequest("PUT", "/api/v1/users/me", bytes.NewBufferString(`{"email":"bob@example.com"}`))
        req = req.WithContext(middleware.WithAuthenticatedUserID(req.Context(), 1))
        w := httptest.NewRecorder()
        handler.UpdateProfile(w, req)
        if w.Code != http.StatusConflict {
            t.Fatalf("expected 409, got %d", w.Code)
        }
        var resp map[string]any
        _ = json.NewDecoder(w.Body).Decode(&resp)
        if resp["message"] != "Email already in use" {
            t.Fatalf("unexpected message: %v", resp["message"])
        }
    })

    t.Run("successful username update", func(t *testing.T) {
        req := httptest.NewRequest("PUT", "/api/v1/users/me", bytes.NewBufferString(`{"username":"alice_new"}`))
        req = req.WithContext(middleware.WithAuthenticatedUserID(req.Context(), 1))
        w := httptest.NewRecorder()
        handler.UpdateProfile(w, req)
        if w.Code != http.StatusOK {
            t.Fatalf("expected 200, got %d", w.Code)
        }
        var resp map[string]any
        _ = json.NewDecoder(w.Body).Decode(&resp)
        if resp["username"] != "alice_new" {
            t.Fatalf("expected username to be updated, got %v", resp["username"])
        }
    })

    t.Run("successful email update", func(t *testing.T) {
        req := httptest.NewRequest("PUT", "/api/v1/users/me", bytes.NewBufferString(`{"email":"alice2@example.com"}`))
        req = req.WithContext(middleware.WithAuthenticatedUserID(req.Context(), 1))
        w := httptest.NewRecorder()
        handler.UpdateProfile(w, req)
        if w.Code != http.StatusOK {
            t.Fatalf("expected 200, got %d", w.Code)
        }
        var resp map[string]any
        _ = json.NewDecoder(w.Body).Decode(&resp)
        if resp["email"] != "alice2@example.com" {
            t.Fatalf("expected email to be updated, got %v", resp["email"])
        }
        if _, ok := resp["updatedAt"]; !ok {
            t.Fatalf("expected updatedAt in response")
        }
    })
}

