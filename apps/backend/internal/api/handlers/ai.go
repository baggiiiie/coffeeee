package handlers

import (
    "database/sql"
    "encoding/json"
    "net/http"
    "strings"

    "coffeeee/backend/internal/config"
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
    type BrewLogPartial struct {
        CoffeeID         *int     `json:"coffeeId,omitempty"`
        BrewMethod       *string  `json:"brewMethod,omitempty"`
        CoffeeWeight     *float64 `json:"coffeeWeight,omitempty"`
        WaterWeight      *float64 `json:"waterWeight,omitempty"`
        GrindSize        *string  `json:"grindSize,omitempty"`
        WaterTemperature *float64 `json:"waterTemperature,omitempty"`
        BrewTime         *int     `json:"brewTime,omitempty"`
        TastingNotes     *string  `json:"tastingNotes,omitempty"`
        Rating           *int     `json:"rating,omitempty"`
    }
    type Req struct {
        // Story 2.4 interactive tasting flow
        Answers []Answer `json:"answers,omitempty"`
        Context *Context `json:"context,omitempty"`
        // Story 3.2 brew recommendation flow
        BrewLog *BrewLogPartial `json:"brewLog,omitempty"`
        Goal    string          `json:"goal,omitempty"`
    }
    type Option struct {
        Label string `json:"label"`
        Value string `json:"value"`
    }
    type QAResp struct {
        QuestionID string   `json:"questionId"`
        Text       string   `json:"text"`
        Options    []Option `json:"options"`
        Hint       *string  `json:"hint,omitempty"`
    }
    type Change struct {
        Variable string `json:"variable"`
        Delta    string `json:"delta"`
    }
    type RecResp struct {
        Change      Change `json:"change"`
        Explanation string `json:"explanation"`
    }

    w.Header().Set("Content-Type", "application/json")

    var body Req
    if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
        w.WriteHeader(http.StatusBadRequest)
        _ = json.NewEncoder(w).Encode(map[string]string{"code": "BAD_REQUEST", "message": "invalid JSON body"})
        return
    }

    // If brewLog+goal present, execute Story 3.2 flow
    if body.BrewLog != nil || strings.TrimSpace(body.Goal) != "" {
        trimmed := strings.TrimSpace(body.Goal)
        if body.BrewLog != nil && trimmed == "" {
            w.WriteHeader(http.StatusBadRequest)
            _ = json.NewEncoder(w).Encode(map[string]string{"code": "BAD_REQUEST", "message": "goal is required"})
            return
        }
        goal := strings.ToLower(trimmed)
        // Simple deterministic rules for demo/testing
        var change Change
        var explanation string
        switch {
        case strings.Contains(goal, "sweet"):
            change = Change{Variable: "grind", Delta: "2 clicks finer"}
            explanation = "A slightly finer grind increases extraction and can enhance perceived sweetness."
        case strings.Contains(goal, "bitter"):
            change = Change{Variable: "waterTemperature", Delta: "-2°C"}
            explanation = "Lowering water temperature slightly can reduce over-extraction bitterness."
        case strings.Contains(goal, "strong") || strings.Contains(goal, "strength"):
            change = Change{Variable: "coffeeWeight", Delta: "+1g per 15g"}
            explanation = "Increasing dose relative to water raises strength without extending brew time."
        default:
            change = Change{Variable: "grind", Delta: "1 click coarser"}
            explanation = "A small grind adjustment is a safe single-variable test to move flavor balance."
        }
        w.WriteHeader(http.StatusOK)
        _ = json.NewEncoder(w).Encode(RecResp{Change: change, Explanation: explanation})
        return
    }

    // Otherwise fallback to Story 2.4 interactive tasting assistant
    // Simple deterministic branching for testing/demo purposes.
    var resp QAResp
    if len(body.Answers) == 0 {
        hint := "Start by identifying the aroma profile."
        resp = QAResp{
            QuestionID: "aroma",
            Text:       "Which aroma best describes the coffee?",
            Options: []Option{{Label: "Floral", Value: "floral"}, {Label: "Nutty", Value: "nutty"}, {Label: "Fruity", Value: "fruity"}},
            Hint:       &hint,
        }
    } else if body.Answers[len(body.Answers)-1].ID == "aroma" {
        // Next question after aroma
        resp = QAResp{
            QuestionID: "acidity",
            Text:       "How would you rate the acidity?",
            Options: []Option{{Label: "Low", Value: "low"}, {Label: "Medium", Value: "medium"}, {Label: "High", Value: "high"}},
        }
    } else {
        resp = QAResp{
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
