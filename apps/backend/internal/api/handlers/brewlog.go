package handlers

import (
	"database/sql"
	"net/http"

	"coffee-companion/backend/internal/config"
)

type BrewLogHandler struct {
	db  *sql.DB
	cfg *config.Config
}

func NewBrewLogHandler(db *sql.DB, cfg *config.Config) *BrewLogHandler {
	return &BrewLogHandler{db: db, cfg: cfg}
}

func (h *BrewLogHandler) List(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement list brew logs logic
	w.WriteHeader(http.StatusNotImplemented)
}

func (h *BrewLogHandler) Get(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement get brew log logic
	w.WriteHeader(http.StatusNotImplemented)
}

func (h *BrewLogHandler) Create(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement create brew log logic
	w.WriteHeader(http.StatusNotImplemented)
}

func (h *BrewLogHandler) Update(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement update brew log logic
	w.WriteHeader(http.StatusNotImplemented)
}

func (h *BrewLogHandler) Delete(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement delete brew log logic
	w.WriteHeader(http.StatusNotImplemented)
}

func (h *BrewLogHandler) ListByUser(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement list brew logs by user logic
	w.WriteHeader(http.StatusNotImplemented)
}
