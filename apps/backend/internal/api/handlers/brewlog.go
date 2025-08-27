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
		CoffeeID         int64    `json:"coffeeId"`
		BrewMethod       string   `json:"brewMethod"`
		CoffeeWeight     *float64 `json:"coffeeWeight,omitempty"`
		WaterWeight      *float64 `json:"waterWeight,omitempty"`
		GrindSize        *string  `json:"grindSize,omitempty"`
		WaterTemperature *float64 `json:"waterTemperature,omitempty"`
		BrewTime         *int64   `json:"brewTime,omitempty"` // seconds
		TastingNotes     *string  `json:"tastingNotes,omitempty"`
		Rating           *int64   `json:"rating,omitempty"`
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

	// Validate inputs
	if body.CoffeeID <= 0 {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"code": "VALIDATION_ERROR", "message": "coffeeId is required"})
		return
	}
	brewMethod := strings.TrimSpace(body.BrewMethod)
	if brewMethod == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"code": "VALIDATION_ERROR", "message": "brewMethod is required"})
		return
	}
	if body.CoffeeWeight != nil && (*body.CoffeeWeight < 0 || *body.CoffeeWeight > 200) {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"code": "VALIDATION_ERROR", "message": "coffeeWeight must be between 0 and 200"})
		return
	}
	if body.WaterWeight != nil && (*body.WaterWeight < 0 || *body.WaterWeight > 3000) {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"code": "VALIDATION_ERROR", "message": "waterWeight must be between 0 and 3000"})
		return
	}
	if body.WaterTemperature != nil && (*body.WaterTemperature < 0 || *body.WaterTemperature > 100) {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"code": "VALIDATION_ERROR", "message": "waterTemperature must be between 0 and 100"})
		return
	}
	if body.BrewTime != nil && (*body.BrewTime < 0 || *body.BrewTime > 3600) {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"code": "VALIDATION_ERROR", "message": "brewTime must be between 0 and 3600 seconds"})
		return
	}
	if body.Rating != nil && (*body.Rating < 1 || *body.Rating > 5) {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"code": "VALIDATION_ERROR", "message": "rating must be between 1 and 5"})
		return
	}

	// Ensure coffee exists and is owned by user (sqlc)
	queries := database.NewQueries(h.db)
	ownerID, err := queries.GetCoffeeOwnerID(r.Context(), body.CoffeeID)
	if err == sql.ErrNoRows {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"code": "NOT_FOUND", "message": "coffee not found"})
		return
	} else if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"code": "DATABASE_ERROR", "message": "failed to lookup coffee"})
		return
	}
	if ownerID != userID {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"code": "FORBIDDEN", "message": "coffee not owned by user"})
		return
	}

	// Insert brew log (sqlc)
	var coffeeWeight, waterWeight sql.NullFloat64
	var grindSize, tastingNotes sql.NullString
	var waterTemp sql.NullFloat64
	var brewTime sql.NullInt64
	var rating sql.NullInt64
	if body.CoffeeWeight != nil {
		coffeeWeight = sql.NullFloat64{Float64: *body.CoffeeWeight, Valid: true}
	}
	if body.WaterWeight != nil {
		waterWeight = sql.NullFloat64{Float64: *body.WaterWeight, Valid: true}
	}
	if body.GrindSize != nil {
		s := strings.TrimSpace(*body.GrindSize)
		if s != "" {
			grindSize = sql.NullString{String: s, Valid: true}
		}
	}
	if body.WaterTemperature != nil {
		waterTemp = sql.NullFloat64{Float64: *body.WaterTemperature, Valid: true}
	}
	if body.BrewTime != nil {
		brewTime = sql.NullInt64{Int64: *body.BrewTime, Valid: true}
	}
	if body.TastingNotes != nil {
		s := strings.TrimSpace(*body.TastingNotes)
		if s != "" {
			tastingNotes = sql.NullString{String: s, Valid: true}
		}
	}
	if body.Rating != nil {
		rating = sql.NullInt64{Int64: *body.Rating, Valid: true}
	}

	id, err := queries.CreateBrewLog(r.Context(), db.CreateBrewLogParams{
		UserID:           userID,
		CoffeeID:         body.CoffeeID,
		BrewMethod:       brewMethod,
		CoffeeWeight:     coffeeWeight,
		WaterWeight:      waterWeight,
		GrindSize:        grindSize,
		WaterTemperature: waterTemp,
		BrewTime:         brewTime,
		TastingNotes:     tastingNotes,
		Rating:           rating,
	})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"code": "DATABASE_ERROR", "message": "failed to create brew log"})
		return
	}
	// Read back (sqlc)
	var out struct {
		ID               int64    `json:"id"`
		UserID           int64    `json:"userId"`
		CoffeeID         int64    `json:"coffeeId"`
		BrewMethod       string   `json:"brewMethod"`
		CoffeeWeight     *float64 `json:"coffeeWeight,omitempty"`
		WaterWeight      *float64 `json:"waterWeight,omitempty"`
		GrindSize        *string  `json:"grindSize,omitempty"`
		WaterTemperature *float64 `json:"waterTemperature,omitempty"`
		BrewTime         *int64   `json:"brewTime,omitempty"`
		TastingNotes     *string  `json:"tastingNotes,omitempty"`
		Rating           *int64   `json:"rating,omitempty"`
		CreatedAt        string   `json:"createdAt"`
	}
	out.ID = id
	out.UserID = userID
	out.CoffeeID = body.CoffeeID
	out.BrewMethod = brewMethod
	// pull timestamps and nullable fields from DB
	if row, err2 := queries.GetBrewLogByID(r.Context(), id); err2 == nil {
		if row.CoffeeWeight.Valid {
			v := row.CoffeeWeight.Float64
			out.CoffeeWeight = &v
		}
		if row.WaterWeight.Valid {
			v := row.WaterWeight.Float64
			out.WaterWeight = &v
		}
		if row.GrindSize.Valid {
			v := row.GrindSize.String
			out.GrindSize = &v
		}
		if row.WaterTemperature.Valid {
			v := row.WaterTemperature.Float64
			out.WaterTemperature = &v
		}
		if row.BrewTime.Valid {
			v := row.BrewTime.Int64
			out.BrewTime = &v
		}
		if row.TastingNotes.Valid {
			v := row.TastingNotes.String
			out.TastingNotes = &v
		}
		if row.Rating.Valid {
			v := row.Rating.Int64
			out.Rating = &v
		}
		if s, ok := row.CreatedAt.(string); ok {
			out.CreatedAt = s
		}
	}

	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(out)
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

func nullIfNilFloat(p *float64) any {
	if p == nil {
		return nil
	}
	return *p
}

func nullIfNilStringPtr(p *string) any {
	if p == nil {
		return nil
	}
	s := strings.TrimSpace(*p)
	if s == "" {
		return nil
	}
	return s
}

func nullIfNilInt(p *int64) any {
	if p == nil {
		return nil
	}
	return *p
}
