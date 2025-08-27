package handlers

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
    "time"

    "coffeeee/backend/internal/api/middleware"
    "coffeeee/backend/internal/config"
    "strconv"
    "github.com/gorilla/mux"
)

func TestBrewLogUpdate_SuccessAndValidation(t *testing.T) {
    db := setupBrewLogTestDB(t)
    defer db.Close()
    h := NewBrewLogHandler(db, &config.Config{})

    // Seed a brew log for user 1
    ts := time.Date(2024, 8, 3, 9, 0, 0, 0, time.UTC).Format(time.RFC3339)
    res, err := db.Exec(`INSERT INTO brew_logs(user_id, coffee_id, brew_method, tasting_notes, rating, created_at) VALUES (1,1,'V60','Yummy',4,?)`, ts)
    if err != nil { t.Fatalf("seed: %v", err) }
    id, _ := res.LastInsertId()

    // Validation error: empty brewMethod
    bBad, _ := json.Marshal(map[string]any{"brewMethod": ""})
    reqBad := httptest.NewRequest("PUT", "/api/v1/brewlogs/"+strconv.FormatInt(id, 10), bytes.NewBuffer(bBad))
    reqBad = mux.SetURLVars(reqBad, map[string]string{"id": strconv.FormatInt(id, 10)})
    reqBad = reqBad.WithContext(middleware.WithAuthenticatedUserID(reqBad.Context(), 1))
    wBad := httptest.NewRecorder()
    h.Update(wBad, reqBad)
    if wBad.Code != http.StatusBadRequest { t.Fatalf("expected 400, got %d", wBad.Code) }

    // Success: update brewMethod and rating
    bGood, _ := json.Marshal(map[string]any{"brewMethod": "Espresso", "rating": 5})
    req := httptest.NewRequest("PUT", "/api/v1/brewlogs/"+strconv.FormatInt(id, 10), bytes.NewBuffer(bGood))
    req = mux.SetURLVars(req, map[string]string{"id": strconv.FormatInt(id, 10)})
    req = req.WithContext(middleware.WithAuthenticatedUserID(req.Context(), 1))
    w := httptest.NewRecorder()
    h.Update(w, req)
    if w.Code != http.StatusOK { t.Fatalf("expected 200, got %d (%s)", w.Code, w.Body.String()) }
    if body := w.Body.String(); body == "" || body == "{}" { t.Fatalf("unexpected empty body") }

    // Forbidden for other user
    req2 := httptest.NewRequest("PUT", "/api/v1/brewlogs/"+strconv.FormatInt(id, 10), bytes.NewBuffer(bGood))
    req2 = mux.SetURLVars(req2, map[string]string{"id": strconv.FormatInt(id, 10)})
    req2 = req2.WithContext(middleware.WithAuthenticatedUserID(req2.Context(), 2))
    w2 := httptest.NewRecorder()
    h.Update(w2, req2)
    if w2.Code != http.StatusForbidden { t.Fatalf("expected 403, got %d", w2.Code) }
}
