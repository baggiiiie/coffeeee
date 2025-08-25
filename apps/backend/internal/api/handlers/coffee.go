package handlers

import (
	"coffeeee/backend/internal/api/middleware"
	"coffeeee/backend/internal/config"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"
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

// ListForUser handles GET /api/v1/coffees
// Returns JSON: { "coffees": [ {id, name, origin?, roaster?, description?, photoPath?, createdAt, updatedAt}, ... ] }
func (h *CoffeeHandler) ListForUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	userID, _ := middleware.GetAuthenticatedUserID(r.Context())
	// NOTE: i don't think i need the below code?
	// it should be already done in `middleware.go`
	// if !ok || userID == 0 {
	// 	w.WriteHeader(http.StatusUnauthorized)
	// 	_ = json.NewEncoder(w).Encode(map[string]string{
	// 		"code":    "AUTHENTICATION_ERROR",
	// 		"message": "Invalid or missing authentication token",
	// 	})
	// 	return
	// }
	// Simple list without pagination for MVP
	rows, err := h.db.Query(`SELECT id, name, origin, roaster, description, photo_path, created_at, updated_at FROM coffees WHERE user_id = ? ORDER BY created_at DESC`, userID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Printf("failed to query coffees for user %d: %v", userID, err)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"code":    "DATABASE_ERROR",
			"message": "failed to query coffees",
		})
		return
	}
	defer rows.Close()

	type coffeeOut struct {
		ID          int64   `json:"id"`
		Name        string  `json:"name"`
		Origin      *string `json:"origin,omitempty"`
		Roaster     *string `json:"roaster,omitempty"`
		Description *string `json:"description,omitempty"`
		PhotoPath   *string `json:"photoPath,omitempty"`
		CreatedAt   string  `json:"createdAt"`
		UpdatedAt   string  `json:"updatedAt"`
	}
	var list []coffeeOut
	for rows.Next() {
		var (
			id                                  int64
			name                                string
			origin, roaster, description, photo sql.NullString
			createdAt, updatedAt                time.Time
		)
		if err := rows.Scan(&id, &name, &origin, &roaster, &description, &photo, &createdAt, &updatedAt); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"code":    "DATABASE_ERROR",
				"message": "failed to read coffees",
			})
			return
		}
		var c coffeeOut
		c.ID = id
		c.Name = name
		if origin.Valid {
			v := origin.String
			c.Origin = &v
		}
		if roaster.Valid {
			v := roaster.String
			c.Roaster = &v
		}
		if description.Valid {
			v := description.String
			c.Description = &v
		}
		if photo.Valid {
			v := photo.String
			c.PhotoPath = &v
		}
		c.CreatedAt = createdAt.Format(time.RFC3339)
		c.UpdatedAt = updatedAt.Format(time.RFC3339)
		list = append(list, c)
	}
	_ = rows.Err()
	_ = json.NewEncoder(w).Encode(map[string]any{"coffees": list})
}

// CreateForUser handles POST /api/v1/coffees
// Request JSON: { "name": string, "origin"?: string, "roaster"?: string, "description"?: string, "photoPath"?: string }
// Behavior: find-or-create a coffee owned by the current user (coffees.user_id),
// optionally updating photo_path for the owner's record. Returns 201 with { "coffee": { ... } }.
func (h *CoffeeHandler) CreateForUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	userID, _ := middleware.GetAuthenticatedUserID(r.Context())
	// if !ok || userID == 0 {
	// 	w.WriteHeader(http.StatusUnauthorized)
	// 	_ = json.NewEncoder(w).Encode(map[string]string{
	// 		"code":    "AUTHENTICATION_ERROR",
	// 		"message": "Invalid or missing authentication token",
	// 	})
	// 	return
	// }

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

	log.Printf("Receiving %v\n", body)
	name := strings.TrimSpace(body.Name)
	if name == "" || len(name) > 255 {
		w.WriteHeader(http.StatusBadRequest)
		errMsg := "name is required and must be <= 255 characters"
		log.Println(errMsg)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"code":    "VALIDATION_ERROR",
			"message": errMsg,
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

	// Find existing coffee by user + name + origin + roaster
	var coffeeID int64
	err = tx.QueryRow(`SELECT id FROM coffees WHERE user_id = ? AND name = ? AND IFNULL(origin,'') = ? AND IFNULL(roaster,'') = ?`, userID, name, origin, roaster).Scan(&coffeeID)
	if err == sql.ErrNoRows {
		// Create user-owned coffee
		res, err := tx.Exec(`INSERT INTO coffees (user_id, name, origin, roaster, description, photo_path) VALUES (?, ?, ?, ?, ?, ?)`, userID, name, nullIfEmpty(origin), nullIfEmpty(roaster), nullIfEmpty(description), nullIfEmpty(photoPath))
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
		log.Printf("failed to query coffee for user %d: %v", userID, err)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"code":    "DATABASE_ERROR",
			"message": "failed to query coffee",
		})
		return
	} else {
		// Coffee exists for this user; update photo_path if provided
		if photoPath != "" {
			if _, err := tx.Exec(`UPDATE coffees SET photo_path = ? WHERE id = ? AND user_id = ?`, photoPath, coffeeID, userID); err != nil {
				log.Printf("failed to update coffee photo_path: %v", err)
			}
		}
	}

	if err := tx.Commit(); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"code":    "INTERNAL_ERROR",
			"message": "failed to commit transaction",
		})
		return
	}

	// Read back coffee and return in {"coffee":{...}}
	var out struct {
		Coffee struct {
			ID          int64   `json:"id"`
			Name        string  `json:"name"`
			Origin      *string `json:"origin,omitempty"`
			Roaster     *string `json:"roaster,omitempty"`
			Description *string `json:"description,omitempty"`
			PhotoPath   *string `json:"photoPath,omitempty"`
			CreatedAt   string  `json:"createdAt"`
			UpdatedAt   string  `json:"updatedAt"`
		} `json:"coffee"`
	}
	out.Coffee.ID = coffeeID
	// Fetch from DB for timestamps and canonical values
	var createdAt, updatedAt time.Time
	var dbOrigin, dbRoaster sql.NullString
	var dbDesc, dbPhoto sql.NullString
	if err := h.db.QueryRow(`SELECT origin, roaster, description, photo_path, created_at, updated_at FROM coffees WHERE id = ?`, coffeeID).Scan(&dbOrigin, &dbRoaster, &dbDesc, &dbPhoto, &createdAt, &updatedAt); err == nil {
		out.Coffee.Name = name
		if dbOrigin.Valid {
			v := dbOrigin.String
			out.Coffee.Origin = &v
		}
		if dbRoaster.Valid {
			v := dbRoaster.String
			out.Coffee.Roaster = &v
		}
		if dbDesc.Valid {
			v := dbDesc.String
			out.Coffee.Description = &v
		}
		if dbPhoto.Valid {
			v := dbPhoto.String
			out.Coffee.PhotoPath = &v
		}
		out.Coffee.CreatedAt = createdAt.Format(time.RFC3339)
		out.Coffee.UpdatedAt = updatedAt.Format(time.RFC3339)
	} else {
		out.Coffee.Name = name
		if photoPath != "" {
			v := photoPath
			out.Coffee.PhotoPath = &v
		}
		out.Coffee.CreatedAt = time.Now().Format(time.RFC3339)
		out.Coffee.UpdatedAt = out.Coffee.CreatedAt
	}

	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(out)
}

func nullIfEmpty(s string) any {
	if strings.TrimSpace(s) == "" {
		return nil
	}
	return s
}
