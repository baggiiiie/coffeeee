package routes

import (
	"database/sql"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"

	"coffee-companion/backend/internal/api/handlers"
	"coffee-companion/backend/internal/api/middleware"
	"coffee-companion/backend/internal/config"
)

func Setup(db *sql.DB, cfg *config.Config) http.Handler {
	router := mux.NewRouter()

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(db, cfg)
	userHandler := handlers.NewUserHandler(db, cfg)
	coffeeHandler := handlers.NewCoffeeHandler(db, cfg)
	brewLogHandler := handlers.NewBrewLogHandler(db, cfg)
	aiHandler := handlers.NewAIHandler(db, cfg)

	// Health check endpoint
	router.HandleFunc("/health", handlers.HealthCheck).Methods("GET")

	// API routes
	api := router.PathPrefix("/api/v1").Subrouter()

	// Public routes
	api.HandleFunc("/auth/login", authHandler.Login).Methods("POST")
	api.HandleFunc("/users", authHandler.Register).Methods("POST")

	// Coffee routes (public read access)
	api.HandleFunc("/coffees", coffeeHandler.List).Methods("GET")
	api.HandleFunc("/coffees/{id:[0-9]+}", coffeeHandler.Get).Methods("GET")

	// Protected routes
	protected := api.PathPrefix("").Subrouter()
	protected.Use(middleware.AuthMiddleware(cfg.JWT.Secret))

	// User routes
	protected.HandleFunc("/users/me", userHandler.GetProfile).Methods("GET")
	protected.HandleFunc("/users/me", userHandler.UpdateProfile).Methods("PUT")
	protected.HandleFunc("/users/me", userHandler.DeleteProfile).Methods("DELETE")

	// Coffee routes (protected write access)
	protected.HandleFunc("/coffees", coffeeHandler.Create).Methods("POST")
	protected.HandleFunc("/coffees/{id:[0-9]+}", coffeeHandler.Update).Methods("PUT")
	protected.HandleFunc("/coffees/{id:[0-9]+}", coffeeHandler.Delete).Methods("DELETE")

	// Brew log routes
	protected.HandleFunc("/brewlogs", brewLogHandler.List).Methods("GET")
	protected.HandleFunc("/brewlogs", brewLogHandler.Create).Methods("POST")
	protected.HandleFunc("/brewlogs/{id:[0-9]+}", brewLogHandler.Get).Methods("GET")
	protected.HandleFunc("/brewlogs/{id:[0-9]+}", brewLogHandler.Update).Methods("PUT")
	protected.HandleFunc("/brewlogs/{id:[0-9]+}", brewLogHandler.Delete).Methods("DELETE")

	// AI routes
	protected.HandleFunc("/ai/extract-coffee", aiHandler.ExtractCoffee).Methods("POST")
	protected.HandleFunc("/ai/recommendation", aiHandler.GetRecommendation).Methods("POST")

	// Public user brew logs
	api.HandleFunc("/users/{userId:[0-9]+}/brewlogs", brewLogHandler.ListByUser).Methods("GET")

	// Apply middleware
	router.Use(middleware.LoggingMiddleware)
	router.Use(middleware.SecurityHeadersMiddleware)
	router.Use(middleware.RecoveryMiddleware)

	// CORS configuration
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   cfg.Server.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	})

	return corsHandler.Handler(router)
}
