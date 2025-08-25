package handlers

import (
    "coffeeee/backend/internal/api/middleware"
    "coffeeee/backend/internal/config"
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
        CoffeeID        int64    `json:"coffeeId"`
        BrewMethod      string   `json:"brewMethod"`
        CoffeeWeight    *float64 `json:"coffeeWeight,omitempty"`
        WaterWeight     *float64 `json:"waterWeight,omitempty"`
        GrindSize       *string  `json:"grindSize,omitempty"`
        WaterTemperature *float64 `json:"waterTemperature,omitempty"`
        BrewTime        *int64   `json:"brewTime,omitempty"` // seconds
        TastingNotes    *string  `json:"tastingNotes,omitempty"`
        Rating          *int64   `json:"rating,omitempty"`
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

    // Ensure coffee exists and is owned by user
    var ownerID int64
    err := h.db.QueryRow(`SELECT user_id FROM coffees WHERE id = ?`, body.CoffeeID).Scan(&ownerID)
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

    // Insert brew log
    res, err := h.db.Exec(`INSERT INTO brew_logs (user_id, coffee_id, brew_method, coffee_weight, water_weight, grind_size, water_temperature, brew_time, tasting_notes, rating)
        VALUES (?,?,?,?,?,?,?,?,?,?)`,
        userID,
        body.CoffeeID,
        brewMethod,
        nullIfNilFloat(body.CoffeeWeight),
        nullIfNilFloat(body.WaterWeight),
        nullIfNilStringPtr(body.GrindSize),
        nullIfNilFloat(body.WaterTemperature),
        nullIfNilInt(body.BrewTime),
        nullIfNilStringPtr(body.TastingNotes),
        nullIfNilInt(body.Rating),
    )
    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        _ = json.NewEncoder(w).Encode(map[string]string{"code": "DATABASE_ERROR", "message": "failed to create brew log"})
        return
    }
    id, _ := res.LastInsertId()

    // Read back
    var out struct {
        ID              int64    `json:"id"`
        UserID          int64    `json:"userId"`
        CoffeeID        int64    `json:"coffeeId"`
        BrewMethod      string   `json:"brewMethod"`
        CoffeeWeight    *float64 `json:"coffeeWeight,omitempty"`
        WaterWeight     *float64 `json:"waterWeight,omitempty"`
        GrindSize       *string  `json:"grindSize,omitempty"`
        WaterTemperature *float64 `json:"waterTemperature,omitempty"`
        BrewTime        *int64   `json:"brewTime,omitempty"`
        TastingNotes    *string  `json:"tastingNotes,omitempty"`
        Rating          *int64   `json:"rating,omitempty"`
        CreatedAt       string   `json:"createdAt"`
    }
    out.ID = id
    out.UserID = userID
    out.CoffeeID = body.CoffeeID
    out.BrewMethod = brewMethod
    // pull timestamps and nullable fields from DB
    var cw, ww, wt sql.NullFloat64
    var bt sql.NullInt64
    var gs, tn sql.NullString
    var rating sql.NullInt64
    var createdAt sql.NullString
    if err := h.db.QueryRow(`SELECT coffee_weight, water_weight, grind_size, water_temperature, brew_time, tasting_notes, rating, strftime('%Y-%m-%dT%H:%M:%fZ', created_at) FROM brew_logs WHERE id = ?`, id).
        Scan(&cw, &ww, &gs, &wt, &bt, &tn, &rating, &createdAt); err == nil {
        if cw.Valid { v := cw.Float64; out.CoffeeWeight = &v }
        if ww.Valid { v := ww.Float64; out.WaterWeight = &v }
        if gs.Valid { v := gs.String; out.GrindSize = &v }
        if wt.Valid { v := wt.Float64; out.WaterTemperature = &v }
        if bt.Valid { v := bt.Int64; out.BrewTime = &v }
        if tn.Valid { v := tn.String; out.TastingNotes = &v }
        if rating.Valid { v := rating.Int64; out.Rating = &v }
        if createdAt.Valid { out.CreatedAt = createdAt.String }
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
    if p == nil { return nil }
    return *p
}

func nullIfNilStringPtr(p *string) any {
    if p == nil { return nil }
    s := strings.TrimSpace(*p)
    if s == "" { return nil }
    return s
}

func nullIfNilInt(p *int64) any {
    if p == nil { return nil }
    return *p
}
