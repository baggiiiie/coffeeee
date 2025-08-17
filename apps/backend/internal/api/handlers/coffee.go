package handlers

import (
	"database/sql"
	"net/http"

	"coffee-companion/backend/internal/config"
)

type CoffeeHandler struct {
	db  *sql.DB
	cfg *config.Config
}

func NewCoffeeHandler(db *sql.DB, cfg *config.Config) *CoffeeHandler {
	return &CoffeeHandler{db: db, cfg: cfg}
}

func (h *CoffeeHandler) List(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement list coffees logic
	w.WriteHeader(http.StatusNotImplemented)
}

func (h *CoffeeHandler) Get(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement get coffee logic
	w.WriteHeader(http.StatusNotImplemented)
}

func (h *CoffeeHandler) Create(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement create coffee logic
	w.WriteHeader(http.StatusNotImplemented)
}

func (h *CoffeeHandler) Update(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement update coffee logic
	w.WriteHeader(http.StatusNotImplemented)
}

func (h *CoffeeHandler) Delete(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement delete coffee logic
	w.WriteHeader(http.StatusNotImplemented)
}
