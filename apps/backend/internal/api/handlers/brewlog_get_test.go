package handlers

import (
    "net/http"
    "net/http/httptest"
    "testing"
    "time"

    "coffeeee/backend/internal/api/middleware"
    "coffeeee/backend/internal/config"
    "strconv"
    "github.com/gorilla/mux"
)

func TestBrewLogGet_SuccessAndAuth(t *testing.T) {
    db := setupBrewLogTestDB(t)
    defer db.Close()
    h := NewBrewLogHandler(db, &config.Config{})

    // Seed a brew log for user 1
    ts := time.Date(2024, 8, 3, 9, 0, 0, 0, time.UTC).Format(time.RFC3339)
    res, err := db.Exec(`INSERT INTO brew_logs(user_id, coffee_id, brew_method, tasting_notes, rating, created_at) VALUES (1,1,'V60','Yummy',4,?)`, ts)
    if err != nil { t.Fatalf("seed: %v", err) }
    id, _ := res.LastInsertId()

    // Unauth
    req := httptest.NewRequest("GET", "/api/v1/brewlogs/1", nil)
    w := httptest.NewRecorder()
    h.Get(w, req)
    if w.Code != http.StatusUnauthorized { t.Fatalf("expected 401, got %d", w.Code) }

    // Success
    req2 := httptest.NewRequest("GET", "/api/v1/brewlogs/"+strconv.FormatInt(id, 10), nil)
    req2 = mux.SetURLVars(req2, map[string]string{"id": strconv.FormatInt(id, 10)})
    req2 = req2.WithContext(middleware.WithAuthenticatedUserID(req2.Context(), 1))
    w2 := httptest.NewRecorder()
    h.Get(w2, req2)
    if w2.Code != http.StatusOK { t.Fatalf("expected 200, got %d (%s)", w2.Code, w2.Body.String()) }
    if body := w2.Body.String(); body == "" || body == "{}" { t.Fatalf("unexpected empty body") }

    // Forbidden for other user
    req3 := httptest.NewRequest("GET", "/api/v1/brewlogs/"+strconv.FormatInt(id, 10), nil)
    req3 = mux.SetURLVars(req3, map[string]string{"id": strconv.FormatInt(id, 10)})
    req3 = req3.WithContext(middleware.WithAuthenticatedUserID(req3.Context(), 2))
    w3 := httptest.NewRecorder()
    h.Get(w3, req3)
    if w3.Code != http.StatusForbidden { t.Fatalf("expected 403, got %d", w3.Code) }
}
