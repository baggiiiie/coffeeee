package handlers

import (
	"coffeeee/backend/internal/api/middleware"
	"coffeeee/backend/internal/config"
	"coffeeee/backend/internal/database"
	db "coffeeee/backend/internal/database/sqlc"
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
	"time"
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

	// Query user from database via sqlc
	queries := database.NewQueries(h.db)
	row, err := queries.GetUserProfileByID(r.Context(), userID)
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
		"username":  row.Username,
		"email":     row.Email,
		"createdAt": row.CreatedAt.Format(time.RFC3339),
		"updatedAt": row.UpdatedAt.Format(time.RFC3339),
	})
}

func (h *UserHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	// Ensure JSON response
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	// Get user ID from context
	userID, ok := middleware.GetAuthenticatedUserID(r.Context())
	if !ok || userID == 0 {
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"code":    "AUTHENTICATION_ERROR",
			"message": "Invalid or missing authentication token",
		})
		return
	}

	// Parse request body
	type reqBody struct {
		Username *string `json:"username,omitempty"`
		Email    *string `json:"email,omitempty"`
	}

	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	var body reqBody
	if err := dec.Decode(&body); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"code":    "VALIDATION_ERROR",
			"message": "invalid JSON body",
		})
		return
	}

	// At least one field must be provided
	if body.Username == nil && body.Email == nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"code":    "VALIDATION_ERROR",
			"message": "At least one field must be provided",
		})
		return
	}

	// Validate fields according to patterns
	var newUsername string
	var newEmail string

	if body.Username != nil {
		newUsername = *body.Username
		if len(newUsername) < 3 || len(newUsername) > 50 {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"code":    "VALIDATION_ERROR",
				"message": "Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens",
			})
			return
		}
		for _, ch := range newUsername {
			if (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch == '_' || ch == '-' {
				continue
			}
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"code":    "VALIDATION_ERROR",
				"message": "Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens",
			})
			return
		}
	}

	if body.Email != nil {
		newEmail = *body.Email
		// Basic format check consistent with AC regex intent
		valid := false
		at := strings.Index(newEmail, "@")
		if at > 0 && at < len(newEmail)-1 {
			dot := strings.Index(newEmail[at+1:], ".")
			if dot > 0 && at+1+dot < len(newEmail)-1 {
				valid = true
			}
		}
		if !valid {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"code":    "VALIDATION_ERROR",
				"message": "Email format is invalid",
			})
			return
		}

		// Check email uniqueness (exclude current user)
		var existingID int64
		existingID, findErr := database.NewQueries(h.db).FindUserIdByEmailExcludingID(r.Context(), db.FindUserIdByEmailExcludingIDParams{Email: newEmail, ID: userID})
		if findErr == nil && existingID != 0 {
			w.WriteHeader(http.StatusConflict)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"code":    "CONFLICT",
				"message": "Email already in use",
			})
			return
		}
		// if err == sql.ErrNoRows -> OK; other errors ignored here
	}

	// Build update statement dynamically
	setParts := make([]string, 0, 2)
	args := make([]any, 0, 3)
	if body.Username != nil {
		setParts = append(setParts, "username = ?")
		args = append(args, newUsername)
	}
	if body.Email != nil {
		setParts = append(setParts, "email = ?")
		args = append(args, newEmail)
	}
	if len(setParts) == 0 {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"code":    "VALIDATION_ERROR",
			"message": "At least one field must be provided",
		})
		return
	}

	// Execute partial update via sqlc
	var u, e string
	if body.Username != nil {
		u = newUsername
	}
	if body.Email != nil {
		e = newEmail
	}
	if err := database.NewQueries(h.db).UpdateUserPartial(r.Context(), db.UpdateUserPartialParams{NULLIF: u, NULLIF_2: e, ID: userID}); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"code":    "VALIDATION_ERROR",
			"message": "Failed to update profile",
		})
		return
	}

	// Read back updated user
	row, err := database.NewQueries(h.db).GetUserProfileByID(r.Context(), userID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"code":    "INTERNAL_ERROR",
			"message": "Internal server error",
		})
		return
	}

	// Respond with updated user
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"id":        userID,
		"username":  row.Username,
		"email":     row.Email,
		"createdAt": row.CreatedAt.Format(time.RFC3339),
		"updatedAt": row.UpdatedAt.Format(time.RFC3339),
	})
}

func (h *UserHandler) DeleteProfile(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement delete profile logic
	w.WriteHeader(http.StatusNotImplemented)
}
