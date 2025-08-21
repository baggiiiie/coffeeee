package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"coffee-companion/backend/internal/api/middleware"
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
	// Get user ID from context (populated by JWT middleware)
	userID, ok := middleware.GetAuthenticatedUserID(r.Context())
	if !ok {
		// This should not happen if middleware is working correctly, but handle defensively
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"code":    "AUTHENTICATION_ERROR",
			"message": "Invalid or missing authentication token",
		})
		return
	}

	// Query user from database
	var username, email string
	var createdAt, updatedAt time.Time
	err := h.db.QueryRow(
		`SELECT username, email, created_at, updated_at FROM users WHERE id = ?`,
		userID,
	).Scan(&username, &email, &createdAt, &updatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			// User not found in database
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"code":    "USER_NOT_FOUND",
				"message": "User not found",
			})
			return
		}
		// Database error
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"code":    "DATABASE_ERROR",
			"message": "Internal server error",
		})
		return
	}

	// Return user profile
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"id":        userID,
		"username":  username,
		"email":     email,
		"createdAt": createdAt.Format(time.RFC3339),
		"updatedAt": updatedAt.Format(time.RFC3339),
	})
}

func (h *UserHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement update profile logic
	w.WriteHeader(http.StatusNotImplemented)
}

func (h *UserHandler) DeleteProfile(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement delete profile logic
	w.WriteHeader(http.StatusNotImplemented)
}
