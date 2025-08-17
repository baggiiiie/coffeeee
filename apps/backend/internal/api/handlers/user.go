package handlers

import (
	"database/sql"
	"net/http"

	"coffee-companion/backend/internal/config"
)

type UserHandler struct {
	db  *sql.DB
	cfg *config.Config
}

func NewUserHandler(db *sql.DB, cfg *config.Config) *UserHandler {
	return &UserHandler{db: db, cfg: cfg}
}

func (h *UserHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement get profile logic
	w.WriteHeader(http.StatusNotImplemented)
}

func (h *UserHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement update profile logic
	w.WriteHeader(http.StatusNotImplemented)
}

func (h *UserHandler) DeleteProfile(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement delete profile logic
	w.WriteHeader(http.StatusNotImplemented)
}
