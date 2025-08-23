package handlers

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

    "coffee-companion/backend/internal/config"
)

func TestAIRecommendation_FirstQuestion(t *testing.T) {
    h := NewAIHandler(nil, &config.Config{})
    req := httptest.NewRequest("POST", "/api/v1/ai/recommendation", bytes.NewBufferString(`{"answers":[]}`))
    w := httptest.NewRecorder()
    h.GetRecommendation(w, req)
    if w.Code != http.StatusOK {
        t.Fatalf("expected 200, got %d", w.Code)
    }
    var resp map[string]any
    if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
        t.Fatalf("decode: %v", err)
    }
    if resp["questionId"] != "aroma" {
        t.Fatalf("expected first question 'aroma', got %v", resp["questionId"])
    }
}

func TestAIRecommendation_NextAfterAroma(t *testing.T) {
    h := NewAIHandler(nil, &config.Config{})
    payload := map[string]any{
        "answers": []map[string]string{{"id": "aroma", "value": "floral"}},
    }
    b, _ := json.Marshal(payload)
    req := httptest.NewRequest("POST", "/api/v1/ai/recommendation", bytes.NewBuffer(b))
    w := httptest.NewRecorder()
    h.GetRecommendation(w, req)
    if w.Code != http.StatusOK { t.Fatalf("expected 200, got %d", w.Code) }
    var resp map[string]any
    _ = json.NewDecoder(w.Body).Decode(&resp)
    if resp["questionId"] != "acidity" {
        t.Fatalf("expected 'acidity', got %v", resp["questionId"])
    }
}

