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
    // minimal schema: users, user-owned coffees + triggers
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
        CREATE TRIGGER update_coffees_updated_at AFTER UPDATE ON coffees BEGIN
            UPDATE coffees SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END;
        CREATE INDEX idx_coffees_user_id ON coffees(user_id);
        CREATE INDEX idx_coffees_user_name ON coffees(user_id, name);
    `)
    if err != nil { t.Fatalf("create schema: %v", err) }
    // seed users
    now := time.Now().Format(time.RFC3339)
    _, err = db.Exec(`INSERT INTO users(id, username, email, password_hash, password_salt, created_at, updated_at) VALUES(1,'u1','u1@example.com','h','s',?,?)`, now, now)
    if err != nil { t.Fatalf("seed user1: %v", err) }
    _, err = db.Exec(`INSERT INTO users(id, username, email, password_hash, password_salt, created_at, updated_at) VALUES(2,'u2','u2@example.com','h','s',?,?)`, now, now)
    if err != nil { t.Fatalf("seed user2: %v", err) }
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

func TestCreateForMe_IdempotentPerUser_AndPhotoUpdate(t *testing.T) {
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
    var resp struct{ Coffee map[string]any `json:"coffee"` }
    if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
        t.Fatalf("invalid json resp: %v", err)
    }
    id1, ok := resp.Coffee["id"].(float64)
    if !ok || resp.Coffee["name"] != "Ethiopia Yirgacheffe" {
        t.Fatalf("unexpected response: %#v", resp.Coffee)
    }
    // Idempotent per user: second call returns same coffee; also updates photo_path
    payload2 := `{"name":"Ethiopia Yirgacheffe","roaster":"Blue Bottle","origin":"Ethiopia","description":"Floral","photoPath":"uploads/coffee-photos/1/`+time.Now().Format("20060102150405")+`/p.jpg"}`
    req2 := httptest.NewRequest("POST", "/api/v1/users/me/coffees", bytes.NewBufferString(payload2))
    req2 = req2.WithContext(middleware.WithAuthenticatedUserID(req2.Context(), 1))
    w2 := httptest.NewRecorder()
    h.CreateForMe(w2, req2)
    if w2.Code != http.StatusCreated {
        t.Fatalf("expected 201 on second call, got %d", w2.Code)
    }
    var resp2 struct{ Coffee map[string]any `json:"coffee"` }
    if err := json.NewDecoder(w2.Body).Decode(&resp2); err != nil {
        t.Fatalf("invalid json resp2: %v", err)
    }
    id2, ok := resp2.Coffee["id"].(float64)
    if !ok || int64(id2) != int64(id1) {
        t.Fatalf("expected same coffee id, got %v vs %v", id1, id2)
    }
    if resp2.Coffee["photoPath"] == nil {
        t.Fatalf("expected photoPath to be set on second call")
    }
}

func TestCreateForMe_DistinctAcrossUsers(t *testing.T) {
    db := setupCoffeeTestDB(t)
    defer db.Close()
    h := NewCoffeeHandler(db, &config.Config{})

    payload := `{"name":"Ethiopia Yirgacheffe","roaster":"Blue Bottle","origin":"Ethiopia"}`
    // User 1
    req1 := httptest.NewRequest("POST", "/api/v1/users/me/coffees", bytes.NewBufferString(payload))
    req1 = req1.WithContext(middleware.WithAuthenticatedUserID(req1.Context(), 1))
    w1 := httptest.NewRecorder()
    h.CreateForMe(w1, req1)
    if w1.Code != http.StatusCreated { t.Fatalf("u1 expected 201, got %d", w1.Code) }
    var r1 struct{ Coffee map[string]any `json:"coffee"` }
    _ = json.NewDecoder(w1.Body).Decode(&r1)
    id1, _ := r1.Coffee["id"].(float64)

    // User 2 same payload → different coffee id
    req2 := httptest.NewRequest("POST", "/api/v1/users/me/coffees", bytes.NewBufferString(payload))
    req2 = req2.WithContext(middleware.WithAuthenticatedUserID(req2.Context(), 2))
    w2 := httptest.NewRecorder()
    h.CreateForMe(w2, req2)
    if w2.Code != http.StatusCreated { t.Fatalf("u2 expected 201, got %d", w2.Code) }
    var r2 struct{ Coffee map[string]any `json:"coffee"` }
    _ = json.NewDecoder(w2.Body).Decode(&r2)
    id2, _ := r2.Coffee["id"].(float64)

    if int64(id1) == int64(id2) {
        t.Fatalf("expected different coffee ids for different users")
    }
}
