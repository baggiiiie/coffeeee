package handlers_test

import (
    "bytes"
    "database/sql"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "path/filepath"
    "runtime"
    "testing"

    "coffee-companion/backend/internal/api/routes"
    "coffee-companion/backend/internal/config"
    "coffee-companion/backend/internal/migrate"

    _ "github.com/mattn/go-sqlite3"
)

// helper to get migrations dir relative to this file
func migrationsDir() string {
    _, file, _, _ := runtime.Caller(0)
    // handlers directory → ../../../migrations
    return filepath.Clean(filepath.Join(filepath.Dir(file), "../../../migrations"))
}

func newTestServer(t *testing.T) (*sql.DB, http.Handler) {
    t.Helper()
    db, err := sql.Open("sqlite3", ":memory:")
    if err != nil { t.Fatalf("open db: %v", err) }
    if err := migrate.ApplyUpToLatest(db, migrationsDir()); err != nil {
        t.Fatalf("migrate up: %v", err)
    }
    cfg := &config.Config{ Server: config.ServerConfig{ AllowedOrigins: []string{"*"} } }
    h := routes.Setup(db, cfg)
    return db, h
}

func TestRegister_Success(t *testing.T) {
    db, handler := newTestServer(t)
    defer db.Close()

    body := map[string]string{"email": "test@example.com", "password": "secret123"}
    b, _ := json.Marshal(body)
    req := httptest.NewRequest(http.MethodPost, "/api/v1/users", bytes.NewReader(b))
    req.Header.Set("Content-Type", "application/json")
    rr := httptest.NewRecorder()

    handler.ServeHTTP(rr, req)

    if rr.Code != http.StatusCreated {
        t.Fatalf("expected 201, got %d: %s", rr.Code, rr.Body.String())
    }
}

func TestRegister_DuplicateEmail(t *testing.T) {
    db, handler := newTestServer(t)
    defer db.Close()

    body := map[string]string{"email": "dup@example.com", "password": "secret123"}
    b, _ := json.Marshal(body)

    // First attempt
    req1 := httptest.NewRequest(http.MethodPost, "/api/v1/users", bytes.NewReader(b))
    req1.Header.Set("Content-Type", "application/json")
    rr1 := httptest.NewRecorder()
    handler.ServeHTTP(rr1, req1)
    if rr1.Code != http.StatusCreated {
        t.Fatalf("first create expected 201, got %d", rr1.Code)
    }

    // Duplicate
    req2 := httptest.NewRequest(http.MethodPost, "/api/v1/users", bytes.NewReader(b))
    req2.Header.Set("Content-Type", "application/json")
    rr2 := httptest.NewRecorder()
    handler.ServeHTTP(rr2, req2)
    if rr2.Code != http.StatusConflict {
        t.Fatalf("duplicate expected 409, got %d: %s", rr2.Code, rr2.Body.String())
    }
}
