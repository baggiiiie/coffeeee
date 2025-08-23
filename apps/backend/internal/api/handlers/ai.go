package handlers

import (
    "database/sql"
    "encoding/json"
    "net/http"

    "coffee-companion/backend/internal/config"
)

type AIHandler struct {
	db  *sql.DB
	cfg *config.Config
}

func NewAIHandler(db *sql.DB, cfg *config.Config) *AIHandler {
	return &AIHandler{db: db, cfg: cfg}
}

func (h *AIHandler) ExtractCoffee(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement AI coffee extraction logic
	w.WriteHeader(http.StatusNotImplemented)
}

func (h *AIHandler) GetRecommendation(w http.ResponseWriter, r *http.Request) {
    type Answer struct {
        ID    string `json:"id"`
        Value string `json:"value"`
    }
    type Context struct {
        BrewMethod *string `json:"brewMethod,omitempty"`
    }
    type Req struct {
        Answers []Answer `json:"answers"`
        Context *Context `json:"context,omitempty"`
    }
    type Option struct {
        Label string `json:"label"`
        Value string `json:"value"`
    }
    type Resp struct {
        QuestionID string   `json:"questionId"`
        Text       string   `json:"text"`
        Options    []Option `json:"options"`
        Hint       *string  `json:"hint,omitempty"`
    }

    w.Header().Set("Content-Type", "application/json")

    var body Req
    if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
        w.WriteHeader(http.StatusBadRequest)
        _ = json.NewEncoder(w).Encode(map[string]string{"code": "BAD_REQUEST", "message": "invalid JSON body"})
        return
    }

    // Simple deterministic branching for testing/demo purposes.
    // In production, this would call an AI provider.
    var resp Resp
    if len(body.Answers) == 0 {
        hint := "Start by identifying the aroma profile."
        resp = Resp{
            QuestionID: "aroma",
            Text:       "Which aroma best describes the coffee?",
            Options: []Option{{Label: "Floral", Value: "floral"}, {Label: "Nutty", Value: "nutty"}, {Label: "Fruity", Value: "fruity"}},
            Hint:       &hint,
        }
    } else if body.Answers[len(body.Answers)-1].ID == "aroma" {
        // Next question after aroma
        resp = Resp{
            QuestionID: "acidity",
            Text:       "How would you rate the acidity?",
            Options: []Option{{Label: "Low", Value: "low"}, {Label: "Medium", Value: "medium"}, {Label: "High", Value: "high"}},
        }
    } else {
        resp = Resp{
            QuestionID: "body",
            Text:       "What is the body like?",
            Options: []Option{{Label: "Light", Value: "light"}, {Label: "Medium", Value: "medium"}, {Label: "Full", Value: "full"}},
        }
    }

    // Optionally use brew method for hint variation
    if body.Context != nil && body.Context.BrewMethod != nil && resp.Hint == nil {
        hint := "Consider how the brew method affects perception."
        resp.Hint = &hint
    }

    w.WriteHeader(http.StatusOK)
    _ = json.NewEncoder(w).Encode(resp)
}
