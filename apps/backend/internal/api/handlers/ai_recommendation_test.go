package handlers

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

    "coffeeee/backend/internal/config"
)

func TestGetRecommendation_BrewSuggestion(t *testing.T) {
    cfg, err := config.Load()
    if err != nil {
        t.Fatalf("failed to load config: %v", err)
    }

    h := NewAIHandler(nil, cfg)

    body := map[string]any{
        "brewLog": map[string]any{
            "brewMethod":       "V60",
            "coffeeWeight":     15,
            "waterWeight":      250,
            "waterTemperature": 94,
            "brewTime":         150,
        },
        "goal": "more sweetness",
    }
    b, _ := json.Marshal(body)

    req := httptest.NewRequest(http.MethodPost, "/api/v1/ai/recommendation", bytes.NewReader(b))
    rec := httptest.NewRecorder()

    h.GetRecommendation(rec, req)

    res := rec.Result()
    if res.StatusCode != http.StatusOK {
        t.Fatalf("expected 200 OK, got %d", res.StatusCode)
    }

    var payload struct {
        Change struct {
            Variable string `json:"variable"`
            Delta    string `json:"delta"`
        } `json:"change"`
        Explanation string `json:"explanation"`
    }
    if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
        t.Fatalf("failed to decode response: %v", err)
    }
    if payload.Change.Variable == "" || payload.Change.Delta == "" || payload.Explanation == "" {
        t.Fatalf("expected populated change and explanation, got: %+v", payload)
    }
}

