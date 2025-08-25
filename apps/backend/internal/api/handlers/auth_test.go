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

	"coffeeee/backend/internal/api/routes"
	"coffeeee/backend/internal/config"
	"coffeeee/backend/internal/migrate"

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
	if err != nil {
		t.Fatalf("open db: %v", err)
	}
	if err := migrate.ApplyUpToLatest(db, migrationsDir()); err != nil {
		t.Fatalf("migrate up: %v", err)
	}
	cfg := &config.Config{
		Server: config.ServerConfig{AllowedOrigins: []string{"*"}},
		JWT: config.JWTConfig{
			Secret: "test-secret-key",
			Expiry: "24h",
		},
	}
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

func TestRegister_InvalidEmail(t *testing.T) {
    db, handler := newTestServer(t)
    defer db.Close()

    body := map[string]string{"email": "not-an-email", "password": "secret123"}
    b, _ := json.Marshal(body)

    req := httptest.NewRequest(http.MethodPost, "/api/v1/users", bytes.NewReader(b))
    req.Header.Set("Content-Type", "application/json")
    rr := httptest.NewRecorder()
    handler.ServeHTTP(rr, req)

    if rr.Code != http.StatusBadRequest {
        t.Fatalf("expected 400 for invalid email, got %d: %s", rr.Code, rr.Body.String())
    }
}

func TestLogin_Success(t *testing.T) {
	db, handler := newTestServer(t)
	defer db.Close()

	// First register a user
	registerBody := map[string]string{"email": "test@example.com", "password": "secret123"}
	registerBytes, _ := json.Marshal(registerBody)
	registerReq := httptest.NewRequest(http.MethodPost, "/api/v1/users", bytes.NewReader(registerBytes))
	registerReq.Header.Set("Content-Type", "application/json")
	registerRr := httptest.NewRecorder()
	handler.ServeHTTP(registerRr, registerReq)
	if registerRr.Code != http.StatusCreated {
		t.Fatalf("register expected 201, got %d", registerRr.Code)
	}

	// Now try to login
	loginBody := map[string]string{"email": "test@example.com", "password": "secret123"}
	loginBytes, _ := json.Marshal(loginBody)
	loginReq := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewReader(loginBytes))
	loginReq.Header.Set("Content-Type", "application/json")
	loginRr := httptest.NewRecorder()

	handler.ServeHTTP(loginRr, loginReq)

	if loginRr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", loginRr.Code, loginRr.Body.String())
	}

	var response map[string]interface{}
	if err := json.Unmarshal(loginRr.Body.Bytes(), &response); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}

	if response["token"] == "" {
		t.Fatal("expected token in response")
	}

	if response["user"] == nil {
		t.Fatal("expected user in response")
	}
}

func TestLogin_WrongPassword(t *testing.T) {
	db, handler := newTestServer(t)
	defer db.Close()

	// First register a user
	registerBody := map[string]string{"email": "test@example.com", "password": "secret123"}
	registerBytes, _ := json.Marshal(registerBody)
	registerReq := httptest.NewRequest(http.MethodPost, "/api/v1/users", bytes.NewReader(registerBytes))
	registerReq.Header.Set("Content-Type", "application/json")
	registerRr := httptest.NewRecorder()
	handler.ServeHTTP(registerRr, registerReq)
	if registerRr.Code != http.StatusCreated {
		t.Fatalf("register expected 201, got %d", registerRr.Code)
	}

	// Try to login with wrong password
	loginBody := map[string]string{"email": "test@example.com", "password": "wrongpassword"}
	loginBytes, _ := json.Marshal(loginBody)
	loginReq := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewReader(loginBytes))
	loginReq.Header.Set("Content-Type", "application/json")
	loginRr := httptest.NewRecorder()

	handler.ServeHTTP(loginRr, loginReq)

	if loginRr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d: %s", loginRr.Code, loginRr.Body.String())
	}
}

func TestLogin_UnknownEmail(t *testing.T) {
	db, handler := newTestServer(t)
	defer db.Close()

	// Try to login with unknown email
	loginBody := map[string]string{"email": "unknown@example.com", "password": "secret123"}
	loginBytes, _ := json.Marshal(loginBody)
	loginReq := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewReader(loginBytes))
	loginReq.Header.Set("Content-Type", "application/json")
	loginRr := httptest.NewRecorder()

	handler.ServeHTTP(loginRr, loginReq)

	if loginRr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d: %s", loginRr.Code, loginRr.Body.String())
	}
}

func TestLogin_InvalidMethod(t *testing.T) {
	db, handler := newTestServer(t)
	defer db.Close()

	// Try GET request instead of POST
	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/login", nil)
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestLogin_InvalidJSON(t *testing.T) {
	db, handler := newTestServer(t)
	defer db.Close()

	// Send invalid JSON
	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewReader([]byte("invalid json")))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestLogin_MissingFields(t *testing.T) {
	db, handler := newTestServer(t)
	defer db.Close()

	// Send request without required fields
	loginBody := map[string]string{"email": "test@example.com"} // missing password
	loginBytes, _ := json.Marshal(loginBody)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewReader(loginBytes))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rr.Code, rr.Body.String())
	}
}
