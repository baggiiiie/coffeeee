package handlers

import (
	"coffee-companion/backend/internal/config"
	"coffee-companion/backend/internal/utils"
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"net/mail"
	"strings"
	"time"

	"github.com/mattn/go-sqlite3"
)

type AuthHandler struct {
	db  *sql.DB
	cfg *config.Config
}

func NewAuthHandler(db *sql.DB, cfg *config.Config) *AuthHandler {
	// NOTE: this is constructor pattern, returning a new instance of AuthHandler
	return &AuthHandler{db: db, cfg: cfg}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	type reqBody struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var body reqBody
	dec := json.NewDecoder(r.Body)
	// NOTE: DisallowUnknownFields set some internal flag to true
	// such that if there's unknown fields to decode, it will return an error
	// "unknown field" anything that is not defined in `reqBody`
	dec.DisallowUnknownFields()
	// NOTE:`&body` is passed in, `body` is type `reqBody`
	// so decoder will decode the JSON body into `body`
	// raise error if fields are missing or unknown
	if err := dec.Decode(&body); err != nil {
		http.Error(w, "invalid JSON body", http.StatusBadRequest)
		return
	}

	email := strings.TrimSpace(strings.ToLower(body.Email))
	password := body.Password
	if email == "" || password == "" {
		http.Error(w, "email and password are required", http.StatusBadRequest)
		return
	}

	// Basic email format validation (defense-in-depth)
	if _, err := mail.ParseAddress(email); err != nil {
		http.Error(w, "invalid email format", http.StatusBadRequest)
		return
	}

	// Query user by email
	var userID int64
	var username, passwordHash, passwordSalt string
	err := h.db.QueryRow(
		`SELECT id, username, password_hash, password_salt FROM users WHERE email = ?`,
		email,
	).Scan(&userID, &username, &passwordHash, &passwordSalt)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "invalid email or password", http.StatusUnauthorized)
			return
		}
		http.Error(w, "database error", http.StatusInternalServerError)
		return
	}

	// Verify password
	if !utils.VerifyPassword(password, passwordSalt, passwordHash) {
		http.Error(w, "invalid email or password", http.StatusUnauthorized)
		return
	}

	// Parse JWT expiry
	expiry, err := time.ParseDuration(h.cfg.JWT.Expiry)
	if err != nil {
		// Default to 24 hours if parsing fails
		expiry = 24 * time.Hour
	}

	// Generate JWT token
	token, err := utils.GenerateToken(userID, email, username, h.cfg.JWT.Secret, expiry)
	if err != nil {
		http.Error(w, "failed to generate token", http.StatusInternalServerError)
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"token": token,
		"user": map[string]any{
			"id":        userID,
			"email":     email,
			"username":  username,
			"createdAt": time.Now().Format(time.RFC3339),
			"updatedAt": time.Now().Format(time.RFC3339),
		},
	})
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	type reqBody struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var body reqBody
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&body); err != nil {
		http.Error(w, "invalid JSON body", http.StatusBadRequest)
		return
	}
	email := strings.TrimSpace(strings.ToLower(body.Email))
	password := body.Password
	if email == "" || password == "" {
		http.Error(w, "email and password are required", http.StatusBadRequest)
		return
	}

	salt, err := utils.GenerateSalt(16)
	if err != nil {
		http.Error(w, "failed to generate salt", http.StatusInternalServerError)
		return
	}
	hash := utils.HashPassword(password, salt)

	// For now, use email as username to satisfy NOT NULL UNIQUE
	username := email

	res, err := h.db.Exec(
		`INSERT INTO users (username, email, password_hash, password_salt) VALUES (?, ?, ?, ?)`,
		username, email, hash, salt,
	)
	if err != nil {
		var sqlErr sqlite3.Error
		// NOTE: This if condition is doing:
		// Is err (or any error it wraps) of type sqlite3.Error?
		// If so, copy it into sqlErr
		if errors.As(err, &sqlErr) {
			// Unique constraint violation
			if sqlErr.ExtendedCode == sqlite3.ErrConstraintUnique || sqlErr.Code == sqlite3.ErrConstraint {
				http.Error(w, "email already in use", http.StatusConflict)
				return
			}
		}
		http.Error(w, "failed to create user", http.StatusInternalServerError)
		return
	}
	id, _ := res.LastInsertId()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"id":       id,
		"email":    email,
		"username": username,
	})
}
