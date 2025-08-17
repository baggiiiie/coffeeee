package handlers

import (
	"database/sql"
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
	// TODO: Implement AI recommendation logic
	w.WriteHeader(http.StatusNotImplemented)
}
