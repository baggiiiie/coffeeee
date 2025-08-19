package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"coffee-companion/backend/internal/config"
	"coffee-companion/backend/internal/utils"
	"github.com/mattn/go-sqlite3"
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
