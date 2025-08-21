package handlers

import (
    "coffee-companion/backend/internal/api/middleware"
    "coffee-companion/backend/internal/config"
    "database/sql"
    "encoding/json"
    "errors"
    "net/http"
    "strings"
    "time"

    "github.com/mattn/go-sqlite3"
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

// CreateForMe handles POST /api/v1/users/me/coffees
// Request JSON: { "name": string, "origin"?: string, "roaster"?: string, "description"?: string, "photoPath"?: string }
// Behavior: find-or-create coffee, then create user_coffees link (idempotent). Returns 201 with coffee and link metadata.
func (h *CoffeeHandler) CreateForMe(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json; charset=utf-8")

    userID, ok := middleware.GetAuthenticatedUserID(r.Context())
    if !ok || userID == 0 {
        w.WriteHeader(http.StatusUnauthorized)
        _ = json.NewEncoder(w).Encode(map[string]string{
            "code":    "AUTHENTICATION_ERROR",
            "message": "Invalid or missing authentication token",
        })
        return
    }

    type reqBody struct {
        Name        string  `json:"name"`
        Origin      *string `json:"origin,omitempty"`
        Roaster     *string `json:"roaster,omitempty"`
        Description *string `json:"description,omitempty"`
        PhotoPath   *string `json:"photoPath,omitempty"`
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

    name := strings.TrimSpace(body.Name)
    if name == "" || len(name) > 255 {
        w.WriteHeader(http.StatusBadRequest)
        _ = json.NewEncoder(w).Encode(map[string]string{
            "code":    "VALIDATION_ERROR",
            "message": "name is required and must be <= 255 characters",
        })
        return
    }
    var origin, roaster, description, photoPath string
    if body.Origin != nil {
        origin = strings.TrimSpace(*body.Origin)
        if len(origin) > 100 {
            w.WriteHeader(http.StatusBadRequest)
            _ = json.NewEncoder(w).Encode(map[string]string{
                "code":    "VALIDATION_ERROR",
                "message": "origin must be <= 100 characters",
            })
            return
        }
    }
    if body.Roaster != nil {
        roaster = strings.TrimSpace(*body.Roaster)
        if len(roaster) > 255 {
            w.WriteHeader(http.StatusBadRequest)
            _ = json.NewEncoder(w).Encode(map[string]string{
                "code":    "VALIDATION_ERROR",
                "message": "roaster must be <= 255 characters",
            })
            return
        }
    }
    if body.Description != nil {
        description = strings.TrimSpace(*body.Description)
    }
    if body.PhotoPath != nil {
        photoPath = strings.TrimSpace(*body.PhotoPath)
        if len(photoPath) > 500 {
            w.WriteHeader(http.StatusBadRequest)
            _ = json.NewEncoder(w).Encode(map[string]string{
                "code":    "VALIDATION_ERROR",
                "message": "photoPath must be <= 500 characters",
            })
            return
        }
    }

    tx, err := h.db.Begin()
    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        _ = json.NewEncoder(w).Encode(map[string]string{
            "code":    "INTERNAL_ERROR",
            "message": "failed to start transaction",
        })
        return
    }
    defer func() { _ = tx.Rollback() }()

    // Find existing coffee by name+origin+roaster
    var coffeeID int64
    err = tx.QueryRow(`SELECT id FROM coffees WHERE name = ? AND IFNULL(origin,'') = ? AND IFNULL(roaster,'') = ?`, name, origin, roaster).Scan(&coffeeID)
    if err == sql.ErrNoRows {
        // Create coffee
        res, err := tx.Exec(`INSERT INTO coffees (name, origin, roaster, description) VALUES (?, ?, ?, ?)`, name, nullIfEmpty(origin), nullIfEmpty(roaster), nullIfEmpty(description))
        if err != nil {
            w.WriteHeader(http.StatusInternalServerError)
            _ = json.NewEncoder(w).Encode(map[string]string{
                "code":    "DATABASE_ERROR",
                "message": "failed to create coffee",
            })
            return
        }
        coffeeID, _ = res.LastInsertId()
    } else if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        _ = json.NewEncoder(w).Encode(map[string]string{
            "code":    "DATABASE_ERROR",
            "message": "failed to query coffee",
        })
        return
    }

    // Link user to coffee (idempotent)
    var linkID int64
    if photoPath != "" {
        _, err = tx.Exec(`INSERT INTO user_coffees (user_id, coffee_id, photo_path) VALUES (?, ?, ?)`, userID, coffeeID, photoPath)
    } else {
        _, err = tx.Exec(`INSERT INTO user_coffees (user_id, coffee_id) VALUES (?, ?)`, userID, coffeeID)
    }
    if err != nil {
        var sqlErr sqlite3.Error
        if errors.As(err, &sqlErr) && (sqlErr.ExtendedCode == sqlite3.ErrConstraintUnique || sqlErr.Code == sqlite3.ErrConstraint) {
            // Already linked – fetch existing link id
            _ = tx.QueryRow(`SELECT id FROM user_coffees WHERE user_id = ? AND coffee_id = ?`, userID, coffeeID).Scan(&linkID)
        } else {
            w.WriteHeader(http.StatusInternalServerError)
            _ = json.NewEncoder(w).Encode(map[string]string{
                "code":    "DATABASE_ERROR",
                "message": "failed to link user to coffee",
            })
            return
        }
    } else {
        // New link inserted – get its ID
        _ = tx.QueryRow(`SELECT id FROM user_coffees WHERE user_id = ? AND coffee_id = ?`, userID, coffeeID).Scan(&linkID)
    }

    if err := tx.Commit(); err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        _ = json.NewEncoder(w).Encode(map[string]string{
            "code":    "INTERNAL_ERROR",
            "message": "failed to commit transaction",
        })
        return
    }

    // Read back coffee and link metadata
    var out struct {
        ID          int64   `json:"id"`
        Name        string  `json:"name"`
        Origin      *string `json:"origin,omitempty"`
        Roaster     *string `json:"roaster,omitempty"`
        Description *string `json:"description,omitempty"`
        CreatedAt   string  `json:"createdAt"`
        UpdatedAt   string  `json:"updatedAt"`
        Link        any     `json:"link,omitempty"`
    }
    out.ID = coffeeID
    // Fetch from DB for timestamps and canonical values
    var createdAt, updatedAt time.Time
    var dbOrigin, dbRoaster sql.NullString
    var dbDesc sql.NullString
    if err := h.db.QueryRow(`SELECT origin, roaster, description, created_at, updated_at FROM coffees WHERE id = ?`, coffeeID).Scan(&dbOrigin, &dbRoaster, &dbDesc, &createdAt, &updatedAt); err == nil {
        out.Name = name
        if dbOrigin.Valid { v := dbOrigin.String; out.Origin = &v }
        if dbRoaster.Valid { v := dbRoaster.String; out.Roaster = &v }
        if dbDesc.Valid { v := dbDesc.String; out.Description = &v }
        out.CreatedAt = createdAt.Format(time.RFC3339)
        out.UpdatedAt = updatedAt.Format(time.RFC3339)
    } else {
        out.Name = name
        out.CreatedAt = time.Now().Format(time.RFC3339)
        out.UpdatedAt = out.CreatedAt
    }
    // Link metadata
    var linkCreated time.Time
    var linkPhoto sql.NullString
    if err := h.db.QueryRow(`SELECT created_at, photo_path FROM user_coffees WHERE id = ?`, linkID).Scan(&linkCreated, &linkPhoto); err == nil {
        var link = map[string]any{
            "id":        linkID,
            "userId":    userID,
            "coffeeId":  coffeeID,
            "createdAt": linkCreated.Format(time.RFC3339),
        }
        if linkPhoto.Valid { link["photoPath"] = linkPhoto.String }
        out.Link = link
    }

    w.WriteHeader(http.StatusCreated)
    _ = json.NewEncoder(w).Encode(out)
}

func nullIfEmpty(s string) any {
    if strings.TrimSpace(s) == "" { return nil }
    return s
}
