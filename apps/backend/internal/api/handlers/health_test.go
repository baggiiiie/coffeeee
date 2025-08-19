package handlers

import (
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
)

func TestHealthCheck(t *testing.T) {
    req := httptest.NewRequest(http.MethodGet, "/health", nil)
    w := httptest.NewRecorder()

    HealthCheck(w, req)

    res := w.Result()
    defer res.Body.Close()

    if res.StatusCode != http.StatusOK {
        t.Fatalf("expected status 200, got %d", res.StatusCode)
    }

    var payload HealthResponse
    if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
        t.Fatalf("failed to decode response: %v", err)
    }

    if payload.Status != "healthy" {
        t.Fatalf("expected status 'healthy', got %q", payload.Status)
    }
}

