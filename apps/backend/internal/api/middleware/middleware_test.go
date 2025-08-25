package middleware

import (
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
    "time"

    "github.com/gorilla/mux"

    "coffeeee/backend/internal/utils"
)

const testSecret = "test-secret-key"

type apiError struct {
    Code    string `json:"code"`
    Message string `json:"message"`
}

func TestMissingAuthorizationHeaderReturns401(t *testing.T) {
    called := false
    next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        called = true
        w.WriteHeader(http.StatusOK)
    })

    handler := AuthMiddleware(testSecret)(next)

    req := httptest.NewRequest(http.MethodGet, "/protected", nil)
    rr := httptest.NewRecorder()
    handler.ServeHTTP(rr, req)

    if called {
        t.Fatalf("next handler should not be called on missing auth header")
    }
    if rr.Code != http.StatusUnauthorized {
        t.Fatalf("expected 401, got %d", rr.Code)
    }
    var e apiError
    _ = json.Unmarshal(rr.Body.Bytes(), &e)
    if e.Code != authErrorCode {
        t.Fatalf("expected error code %s, got %s", authErrorCode, e.Code)
    }
}

func TestMalformedTokenReturns401(t *testing.T) {
    next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
    })
    handler := AuthMiddleware(testSecret)(next)

    req := httptest.NewRequest(http.MethodGet, "/protected", nil)
    req.Header.Set("Authorization", "Bearer not-a-valid-jwt")
    rr := httptest.NewRecorder()
    handler.ServeHTTP(rr, req)

    if rr.Code != http.StatusUnauthorized {
        t.Fatalf("expected 401, got %d", rr.Code)
    }
}

func TestExpiredTokenReturns401(t *testing.T) {
    token, err := utils.GenerateToken(123, "u@example.com", "user", testSecret, -1*time.Minute)
    if err != nil {
        t.Fatalf("failed generating token: %v", err)
    }

    next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
    })
    handler := AuthMiddleware(testSecret)(next)

    req := httptest.NewRequest(http.MethodGet, "/protected", nil)
    req.Header.Set("Authorization", "Bearer "+token)
    rr := httptest.NewRecorder()
    handler.ServeHTTP(rr, req)

    if rr.Code != http.StatusUnauthorized {
        t.Fatalf("expected 401, got %d", rr.Code)
    }
}

func TestValidTokenPassesAndContextPopulated(t *testing.T) {
    token, err := utils.GenerateToken(456, "u@example.com", "user", testSecret, 1*time.Hour)
    if err != nil {
        t.Fatalf("failed generating token: %v", err)
    }

    var gotUserID int64
    called := false
    next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        called = true
        if id, ok := GetAuthenticatedUserID(r.Context()); ok {
            gotUserID = id
        }
        if _, ok := GetAuthClaims(r.Context()); !ok {
            t.Fatalf("expected claims in context")
        }
        w.WriteHeader(http.StatusOK)
    })
    handler := AuthMiddleware(testSecret)(next)

    req := httptest.NewRequest(http.MethodGet, "/protected", nil)
    req.Header.Set("Authorization", "Bearer "+token)
    rr := httptest.NewRecorder()
    handler.ServeHTTP(rr, req)

    if rr.Code != http.StatusOK {
        t.Fatalf("expected 200, got %d", rr.Code)
    }
    if !called {
        t.Fatalf("next handler was not called")
    }
    if gotUserID != 456 {
        t.Fatalf("expected userID 456, got %d", gotUserID)
    }
}

func TestIntegrationProtectedRoute(t *testing.T) {
    router := mux.NewRouter()
    api := router.PathPrefix("/api/v1").Subrouter()
    protected := api.PathPrefix("").Subrouter()
    protected.Use(AuthMiddleware(testSecret))
    protected.HandleFunc("/protected", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
    }).Methods("GET")

    // Without token
    req1 := httptest.NewRequest(http.MethodGet, "/api/v1/protected", nil)
    rr1 := httptest.NewRecorder()
    router.ServeHTTP(rr1, req1)
    if rr1.Code != http.StatusUnauthorized {
        t.Fatalf("expected 401 without token, got %d", rr1.Code)
    }

    // With valid token
    token, err := utils.GenerateToken(789, "u@example.com", "user", testSecret, 1*time.Hour)
    if err != nil {
        t.Fatalf("failed generating token: %v", err)
    }
    req2 := httptest.NewRequest(http.MethodGet, "/api/v1/protected", nil)
    req2.Header.Set("Authorization", "Bearer "+token)
    rr2 := httptest.NewRecorder()
    router.ServeHTTP(rr2, req2)
    if rr2.Code != http.StatusOK {
        t.Fatalf("expected 200 with valid token, got %d", rr2.Code)
    }
}

