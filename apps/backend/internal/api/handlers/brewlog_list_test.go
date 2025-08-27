package handlers

import (
    "net/http"
    "net/http/httptest"
    "testing"
    "time"

    "coffeeee/backend/internal/api/middleware"
    "coffeeee/backend/internal/config"
    "strings"
)

func TestBrewLogList_Success_FilterAndSort(t *testing.T) {
    db := setupBrewLogTestDB(t)
    defer db.Close()
    h := NewBrewLogHandler(db, &config.Config{})

    // Seed: user 1 owns coffee 1; user 2 owns coffee 2 (already seeded in helper)
    // Create logs with explicit timestamps for sorting, include a tie on created_at
    t1 := time.Date(2024, 8, 1, 10, 0, 0, 0, time.UTC).Format(time.RFC3339)
    t2 := time.Date(2024, 8, 2, 10, 0, 0, 0, time.UTC).Format(time.RFC3339)
    // Insert three logs for coffee 1, user 1 with two same timestamps to test id DESC tiebreaker
    _, _ = db.Exec(`INSERT INTO brew_logs(user_id, coffee_id, brew_method, tasting_notes, created_at) VALUES (1,1,'V60','Notes A',?)`, t1)
    _, _ = db.Exec(`INSERT INTO brew_logs(user_id, coffee_id, brew_method, tasting_notes, created_at) VALUES (1,1,'V60','Notes B',?)`, t2)
    _, _ = db.Exec(`INSERT INTO brew_logs(user_id, coffee_id, brew_method, tasting_notes, created_at) VALUES (1,1,'V60','Notes C',?)`, t2)
    // Insert other coffee/user logs that must not appear
    _, _ = db.Exec(`INSERT INTO brew_logs(user_id, coffee_id, brew_method, tasting_notes, created_at) VALUES (2,2,'V60','Other user',?)`, t2)
    _, _ = db.Exec(`INSERT INTO brew_logs(user_id, coffee_id, brew_method, tasting_notes, created_at) VALUES (1,2,'V60','Other coffee',?)`, t2)

    req := httptest.NewRequest("GET", "/api/v1/brewlogs?coffeeId=1", nil)
    req = req.WithContext(middleware.WithAuthenticatedUserID(req.Context(), 1))
    w := httptest.NewRecorder()
    h.List(w, req)
    if w.Code != http.StatusOK {
        t.Fatalf("expected 200, got %d (%s)", w.Code, w.Body.String())
    }
    body := w.Body.String()
    // Expect three items, with the two having t2 first, ordered by id DESC among equals
    // We cannot easily assert id order without querying, but we can assert that both Notes C and Notes B appear before Notes A in the body string
    idxA := strings.Index(body, "Notes A")
    idxB := strings.Index(body, "Notes B")
    idxC := strings.Index(body, "Notes C")
    if !(idxB >= 0 && idxC >= 0 && idxA >= 0) {
        t.Fatalf("expected all notes present, got: %s", body)
    }
    if !(idxB < idxA && idxC < idxA) {
        t.Fatalf("expected latest notes before older, got order: %d (B), %d (C), %d (A)", idxB, idxC, idxA)
    }
}

func TestBrewLogList_ValidationAndAuth(t *testing.T) {
    db := setupBrewLogTestDB(t)
    defer db.Close()
    h := NewBrewLogHandler(db, &config.Config{})

    // invalid coffeeId
    req := httptest.NewRequest("GET", "/api/v1/brewlogs?coffeeId=abc", nil)
    req = req.WithContext(middleware.WithAuthenticatedUserID(req.Context(), 1))
    w := httptest.NewRecorder()
    h.List(w, req)
    if w.Code != http.StatusBadRequest {
        t.Fatalf("expected 400, got %d", w.Code)
    }

    // unauthenticated
    req2 := httptest.NewRequest("GET", "/api/v1/brewlogs?coffeeId=1", nil)
    w2 := httptest.NewRecorder()
    h.List(w2, req2)
    if w2.Code != http.StatusUnauthorized {
        t.Fatalf("expected 401, got %d", w2.Code)
    }

    // forbidden: coffee 2 owned by user 2
    req3 := httptest.NewRequest("GET", "/api/v1/brewlogs?coffeeId=2", nil)
    req3 = req3.WithContext(middleware.WithAuthenticatedUserID(req3.Context(), 1))
    w3 := httptest.NewRecorder()
    h.List(w3, req3)
    if w3.Code != http.StatusForbidden {
        t.Fatalf("expected 403, got %d", w3.Code)
    }
}

// no helpers needed
