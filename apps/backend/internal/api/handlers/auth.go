package handlers

import (
	"database/sql"
	"net/http"

	"coffee-companion/backend/internal/config"
)

type AuthHandler struct {
	db  *sql.DB
	cfg *config.Config
}

func NewAuthHandler(db *sql.DB, cfg *config.Config) *AuthHandler {
	return &AuthHandler{db: db, cfg: cfg}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement login logic
	w.WriteHeader(http.StatusNotImplemented)
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement register logic
	w.WriteHeader(http.StatusNotImplemented)
}
