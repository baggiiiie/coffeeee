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
    "strconv"
    
    "github.com/gorilla/mux"
)

type BrewLogHandler struct {
	db  *sql.DB
	cfg *config.Config
}

func NewBrewLogHandler(db *sql.DB, cfg *config.Config) *BrewLogHandler {
	return &BrewLogHandler{db: db, cfg: cfg}
}

func (h *BrewLogHandler) List(w http.ResponseWriter, r *http.Request) {
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

    // Parse and validate query params
    q := r.URL.Query()
    coffeeIDStr := strings.TrimSpace(q.Get("coffeeId"))
    if coffeeIDStr == "" {
        w.WriteHeader(http.StatusBadRequest)
        _ = json.NewEncoder(w).Encode(map[string]string{"code": "VALIDATION_ERROR", "message": "coffeeId is required"})
        return
    }
    coffeeID, err := strconv.ParseInt(coffeeIDStr, 10, 64)
    if err != nil || coffeeID <= 0 {
            w.WriteHeader(http.StatusBadRequest)
            _ = json.NewEncoder(w).Encode(map[string]string{"code": "VALIDATION_ERROR", "message": "coffeeId must be a positive integer"})
            return
    }

    limit := int64(20)
    if l := strings.TrimSpace(q.Get("limit")); l != "" {
        if v, err := strconv.ParseInt(l, 10, 64); err == nil && v > 0 && v <= 100 {
            limit = v
        }
    }
    offset := int64(0)
    if o := strings.TrimSpace(q.Get("offset")); o != "" {
        if v, err := strconv.ParseInt(o, 10, 64); err == nil && v >= 0 {
            offset = v
        }
    }

    // Ensure coffee exists and is owned by the user
    queries := database.NewQueries(h.db)
    ownerID, err := queries.GetCoffeeOwnerID(r.Context(), coffeeID)
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

    // Query brew logs filtered by user and coffee
    type rowT struct {
        id         int64
        createdAt  string
        method     string
        coffeeW    sql.NullFloat64
        waterW     sql.NullFloat64
        rating     sql.NullInt64
        notesValid bool
        notes      string
    }

    const sqlQuery = `
        SELECT id,
               strftime('%Y-%m-%dT%H:%M:%fZ', created_at) AS created_at,
               brew_method,
               coffee_weight,
               water_weight,
               rating,
               tasting_notes IS NOT NULL AS notes_valid,
               IFNULL(tasting_notes, '') AS notes
        FROM brew_logs
        WHERE user_id = ? AND coffee_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT ? OFFSET ?
    `
    rows, err := h.db.QueryContext(r.Context(), sqlQuery, userID, coffeeID, limit, offset)
    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        _ = json.NewEncoder(w).Encode(map[string]string{"code": "DATABASE_ERROR", "message": "failed to query brew logs"})
        return
    }
    defer rows.Close()

    type item struct {
        ID           int64    `json:"id"`
        CreatedAt    string   `json:"createdAt"`
        BrewMethod   string   `json:"brewMethod"`
        CoffeeWeight *float64 `json:"coffeeWeight,omitempty"`
        WaterWeight  *float64 `json:"waterWeight,omitempty"`
        Rating       *int64   `json:"rating,omitempty"`
        TastingNotes *string  `json:"tastingNotes,omitempty"`
    }
    var out []item
    for rows.Next() {
        var r rowT
        if err := rows.Scan(&r.id, &r.createdAt, &r.method, &r.coffeeW, &r.waterW, &r.rating, &r.notesValid, &r.notes); err != nil {
            w.WriteHeader(http.StatusInternalServerError)
            _ = json.NewEncoder(w).Encode(map[string]string{"code": "DATABASE_ERROR", "message": "failed to read brew logs"})
            return
        }
        it := item{ID: r.id, CreatedAt: r.createdAt, BrewMethod: r.method}
        if r.coffeeW.Valid {
            v := r.coffeeW.Float64
            it.CoffeeWeight = &v
        }
        if r.waterW.Valid {
            v := r.waterW.Float64
            it.WaterWeight = &v
        }
        if r.rating.Valid {
            v := r.rating.Int64
            it.Rating = &v
        }
        if r.notesValid {
            s := r.notes
            it.TastingNotes = &s
        }
        out = append(out, it)
    }
    _ = json.NewEncoder(w).Encode(map[string]any{"brewLogs": out})
}

func (h *BrewLogHandler) Get(w http.ResponseWriter, r *http.Request) {
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

    vars := mux.Vars(r)
    idStr := strings.TrimSpace(vars["id"])
    id, err := strconv.ParseInt(idStr, 10, 64)
    if err != nil || id <= 0 {
        w.WriteHeader(http.StatusBadRequest)
        _ = json.NewEncoder(w).Encode(map[string]string{"code": "VALIDATION_ERROR", "message": "invalid id"})
        return
    }

    // Read brew log and enforce ownership
    type rowT struct {
        ID              int64
        UserID          int64
        CoffeeID        int64
        BrewMethod      string
        CoffeeWeight    sql.NullFloat64
        WaterWeight     sql.NullFloat64
        GrindSize       sql.NullString
        WaterTemperature sql.NullFloat64
        BrewTime        sql.NullInt64
        TastingNotes    sql.NullString
        Rating          sql.NullInt64
        CreatedAt       string
    }
    const sqlSel = `
        SELECT id, user_id, coffee_id, brew_method,
               coffee_weight, water_weight, grind_size,
               water_temperature, brew_time, tasting_notes,
               rating,
               strftime('%Y-%m-%dT%H:%M:%fZ', created_at) AS created_at
        FROM brew_logs
        WHERE id = ?
    `
    var row rowT
    err = h.db.QueryRowContext(r.Context(), sqlSel, id).Scan(
        &row.ID, &row.UserID, &row.CoffeeID, &row.BrewMethod,
        &row.CoffeeWeight, &row.WaterWeight, &row.GrindSize,
        &row.WaterTemperature, &row.BrewTime, &row.TastingNotes,
        &row.Rating, &row.CreatedAt,
    )
    if err == sql.ErrNoRows {
        w.WriteHeader(http.StatusNotFound)
        _ = json.NewEncoder(w).Encode(map[string]string{"code": "NOT_FOUND", "message": "brew log not found"})
        return
    } else if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        _ = json.NewEncoder(w).Encode(map[string]string{"code": "DATABASE_ERROR", "message": "failed to read brew log"})
        return
    }
    if row.UserID != userID {
        w.WriteHeader(http.StatusForbidden)
        _ = json.NewEncoder(w).Encode(map[string]string{"code": "FORBIDDEN", "message": "brew log not owned by user"})
        return
    }

    type outT struct {
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
    out := outT{
        ID:         row.ID,
        UserID:     row.UserID,
        CoffeeID:   row.CoffeeID,
        BrewMethod: row.BrewMethod,
        CreatedAt:  row.CreatedAt,
    }
    if row.CoffeeWeight.Valid { v := row.CoffeeWeight.Float64; out.CoffeeWeight = &v }
    if row.WaterWeight.Valid { v := row.WaterWeight.Float64; out.WaterWeight = &v }
    if row.GrindSize.Valid { v := row.GrindSize.String; out.GrindSize = &v }
    if row.WaterTemperature.Valid { v := row.WaterTemperature.Float64; out.WaterTemperature = &v }
    if row.BrewTime.Valid { v := row.BrewTime.Int64; out.BrewTime = &v }
    if row.TastingNotes.Valid { v := row.TastingNotes.String; out.TastingNotes = &v }
    if row.Rating.Valid { v := row.Rating.Int64; out.Rating = &v }

    _ = json.NewEncoder(w).Encode(out)
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

    vars := mux.Vars(r)
    idStr := strings.TrimSpace(vars["id"])
    id, err := strconv.ParseInt(idStr, 10, 64)
    if err != nil || id <= 0 {
        w.WriteHeader(http.StatusBadRequest)
        _ = json.NewEncoder(w).Encode(map[string]string{"code": "VALIDATION_ERROR", "message": "invalid id"})
        return
    }

    // Body: editable fields; coffeeId is immutable here
    type reqBody struct {
        BrewMethod       *string  `json:"brewMethod,omitempty"`
        CoffeeWeight     *float64 `json:"coffeeWeight,omitempty"`
        WaterWeight      *float64 `json:"waterWeight,omitempty"`
        GrindSize        *string  `json:"grindSize,omitempty"`
        WaterTemperature *float64 `json:"waterTemperature,omitempty"`
        BrewTime         *int64   `json:"brewTime,omitempty"`
        TastingNotes     *string  `json:"tastingNotes,omitempty"`
        Rating           *int64   `json:"rating,omitempty"`
    }
    dec := json.NewDecoder(r.Body)
    dec.DisallowUnknownFields()
    var body reqBody
    if err := dec.Decode(&body); err != nil {
        w.WriteHeader(http.StatusBadRequest)
        _ = json.NewEncoder(w).Encode(map[string]string{"code": "VALIDATION_ERROR", "message": "invalid JSON body"})
        return
    }

    // Validate bounds
    if body.BrewMethod != nil {
        bm := strings.TrimSpace(*body.BrewMethod)
        if bm == "" { w.WriteHeader(http.StatusBadRequest); _ = json.NewEncoder(w).Encode(map[string]string{"code": "VALIDATION_ERROR", "message": "brewMethod cannot be empty"}); return }
    }
    if body.CoffeeWeight != nil && (*body.CoffeeWeight < 0 || *body.CoffeeWeight > 200) {
        w.WriteHeader(http.StatusBadRequest); _ = json.NewEncoder(w).Encode(map[string]string{"code": "VALIDATION_ERROR", "message": "coffeeWeight must be between 0 and 200"}); return
    }
    if body.WaterWeight != nil && (*body.WaterWeight < 0 || *body.WaterWeight > 3000) {
        w.WriteHeader(http.StatusBadRequest); _ = json.NewEncoder(w).Encode(map[string]string{"code": "VALIDATION_ERROR", "message": "waterWeight must be between 0 and 3000"}); return
    }
    if body.WaterTemperature != nil && (*body.WaterTemperature < 0 || *body.WaterTemperature > 100) {
        w.WriteHeader(http.StatusBadRequest); _ = json.NewEncoder(w).Encode(map[string]string{"code": "VALIDATION_ERROR", "message": "waterTemperature must be between 0 and 100"}); return
    }
    if body.BrewTime != nil && (*body.BrewTime < 0 || *body.BrewTime > 3600) {
        w.WriteHeader(http.StatusBadRequest); _ = json.NewEncoder(w).Encode(map[string]string{"code": "VALIDATION_ERROR", "message": "brewTime must be between 0 and 3600 seconds"}); return
    }
    if body.Rating != nil && (*body.Rating < 1 || *body.Rating > 5) {
        w.WriteHeader(http.StatusBadRequest); _ = json.NewEncoder(w).Encode(map[string]string{"code": "VALIDATION_ERROR", "message": "rating must be between 1 and 5"}); return
    }

    // Ensure brew log exists and user owns it
    var ownerID int64
    err = h.db.QueryRowContext(r.Context(), "SELECT user_id FROM brew_logs WHERE id = ?", id).Scan(&ownerID)
    if err == sql.ErrNoRows {
        w.WriteHeader(http.StatusNotFound)
        _ = json.NewEncoder(w).Encode(map[string]string{"code": "NOT_FOUND", "message": "brew log not found"})
        return
    } else if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        _ = json.NewEncoder(w).Encode(map[string]string{"code": "DATABASE_ERROR", "message": "failed to lookup brew log"})
        return
    }
    if ownerID != userID {
        w.WriteHeader(http.StatusForbidden)
        _ = json.NewEncoder(w).Encode(map[string]string{"code": "FORBIDDEN", "message": "brew log not owned by user"})
        return
    }

    // Build UPDATE with provided fields only
    setClauses := []string{}
    args := []any{}
    if body.BrewMethod != nil {
        setClauses = append(setClauses, "brew_method = ?")
        args = append(args, strings.TrimSpace(*body.BrewMethod))
    }
    if body.CoffeeWeight != nil {
        setClauses = append(setClauses, "coffee_weight = ?")
        args = append(args, nullIfNilFloat(body.CoffeeWeight))
    }
    if body.WaterWeight != nil {
        setClauses = append(setClauses, "water_weight = ?")
        args = append(args, nullIfNilFloat(body.WaterWeight))
    }
    if body.GrindSize != nil {
        setClauses = append(setClauses, "grind_size = ?")
        args = append(args, nullIfNilStringPtr(body.GrindSize))
    }
    if body.WaterTemperature != nil {
        setClauses = append(setClauses, "water_temperature = ?")
        args = append(args, nullIfNilFloat(body.WaterTemperature))
    }
    if body.BrewTime != nil {
        setClauses = append(setClauses, "brew_time = ?")
        args = append(args, nullIfNilInt(body.BrewTime))
    }
    if body.TastingNotes != nil {
        setClauses = append(setClauses, "tasting_notes = ?")
        args = append(args, nullIfNilStringPtr(body.TastingNotes))
    }
    if body.Rating != nil {
        setClauses = append(setClauses, "rating = ?")
        args = append(args, nullIfNilInt(body.Rating))
    }

    if len(setClauses) == 0 {
        // nothing to update
        // Return current state
        r2 := r.Clone(r.Context())
        h.Get(w, r2)
        return
    }
    query := "UPDATE brew_logs SET " + strings.Join(setClauses, ", ") + " WHERE id = ? AND user_id = ?"
    args = append(args, id, userID)
    if _, err := h.db.ExecContext(r.Context(), query, args...); err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        _ = json.NewEncoder(w).Encode(map[string]string{"code": "DATABASE_ERROR", "message": "failed to update brew log"})
        return
    }
    // Return updated
    h.Get(w, r)
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

// parseInt64 parses a base-10 integer string into int64.
// (no-op placeholder to avoid accidental import removal by tools)
