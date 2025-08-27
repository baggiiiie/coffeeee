package handlers

import (
	"coffeeee/backend/internal/api/middleware"
	"coffeeee/backend/internal/config"
	"coffeeee/backend/internal/services"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type CoffeeHandler struct {
	coffeeService *services.CoffeeService
	cfg           *config.Config
}

func NewCoffeeHandler(coffeeService *services.CoffeeService, cfg *config.Config) *CoffeeHandler {
	return &CoffeeHandler{
		coffeeService: coffeeService,
		cfg:           cfg,
	}
}

func (h *CoffeeHandler) List(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement list coffees logic
	w.WriteHeader(http.StatusNotImplemented)
}

func (h *CoffeeHandler) Get(w http.ResponseWriter, r *http.Request) {
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
	idStr := vars["id"]
	coffeeID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil || coffeeID <= 0 {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"code": "VALIDATION_ERROR", "message": "invalid id"})
		return
	}

	coffee, err := h.coffeeService.GetForUserByID(r.Context(), coffeeID, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(map[string]string{"code": "NOT_FOUND", "message": "coffee not found"})
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"code": "DATABASE_ERROR", "message": "failed to read coffee"})
		return
	}

	_ = json.NewEncoder(w).Encode(map[string]any{"coffee": coffee})
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

	coffees, err := h.coffeeService.ListForUser(r.Context(), userID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Printf("failed to query coffees for user %d: %v", userID, err)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"code":    "DATABASE_ERROR",
			"message": "failed to query coffees",
		})
		return
	}

	_ = json.NewEncoder(w).Encode(map[string]any{"coffees": coffees})
}

// CreateForUser handles POST /api/v1/coffees
// Request JSON: { "name": string, "origin"?: string, "roaster"?: string, "description"?: string, "photoPath"?: string }
// Behavior: find-or-create a coffee owned by the current user (coffees.user_id),
// optionally updating photo_path for the owner's record. Returns 201 with { "coffee": { ... } }.
func (h *CoffeeHandler) CreateForUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	userID, _ := middleware.GetAuthenticatedUserID(r.Context())

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

	input := services.CreateCoffeeInput{
		UserID:      userID,
		Name:        body.Name,
		Origin:      body.Origin,
		Roaster:     body.Roaster,
		Description: body.Description,
		PhotoPath:   body.PhotoPath,
	}

	coffee, err := h.coffeeService.CreateForUser(r.Context(), input)
	if err != nil {
		if validationErr, ok := err.(*services.ValidationError); ok {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"code":    "VALIDATION_ERROR",
				"message": validationErr.Message,
			})
			return
		}

		w.WriteHeader(http.StatusInternalServerError)
		log.Printf("failed to create coffee for user %d: %v", userID, err)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"code":    "DATABASE_ERROR",
			"message": "failed to create coffee",
		})
		return
	}

	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]any{"coffee": coffee})
}
