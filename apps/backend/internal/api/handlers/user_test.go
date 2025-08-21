package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"coffee-companion/backend/internal/api/middleware"
	"coffee-companion/backend/internal/config"
)

func TestUserHandler_GetProfile(t *testing.T) {
	// Setup test database
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("Failed to open test database: %v", err)
	}
	defer db.Close()

	// Create users table
	_, err = db.Exec(`
		CREATE TABLE users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username VARCHAR(50) NOT NULL UNIQUE,
			email VARCHAR(255) NOT NULL UNIQUE,
			password_hash VARCHAR(255) NOT NULL,
			password_salt VARCHAR(255) NOT NULL,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		t.Fatalf("Failed to create users table: %v", err)
	}

	// Insert test user
	now := time.Now().Format(time.RFC3339)
	_, err = db.Exec(`
		INSERT INTO users (id, username, email, password_hash, password_salt, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`, 1, "testuser", "test@example.com", "hash", "salt", now, now)
	if err != nil {
		t.Fatalf("Failed to insert test user: %v", err)
	}

	// Setup handler
	cfg := &config.Config{}
	handler := NewUserHandler(db, cfg)

	tests := []struct {
		name           string
		userID         int64
		setupContext   func(r *http.Request) *http.Request
		expectedStatus int
		expectedBody   map[string]interface{}
	}{
		{
			name:   "successful profile retrieval",
			userID: 1,
			setupContext: func(r *http.Request) *http.Request {
				ctx := middleware.WithAuthenticatedUserID(r.Context(), int64(1))
				return r.WithContext(ctx)
			},
			expectedStatus: http.StatusOK,
			expectedBody: map[string]interface{}{
				"id":        float64(1), // JSON numbers are float64
				"username":  "testuser",
				"email":     "test@example.com",
				"createdAt": now,
				"updatedAt": now,
			},
		},
		{
			name:   "user not found",
			userID: 999,
			setupContext: func(r *http.Request) *http.Request {
				ctx := middleware.WithAuthenticatedUserID(r.Context(), int64(999))
				return r.WithContext(ctx)
			},
			expectedStatus: http.StatusNotFound,
			expectedBody: map[string]interface{}{
				"code":    "USER_NOT_FOUND",
				"message": "User not found",
			},
		},
		{
			name:   "missing user ID in context",
			userID: 0,
			setupContext: func(r *http.Request) *http.Request {
				// Don't set user ID in context
				return r
			},
			expectedStatus: http.StatusUnauthorized,
			expectedBody: map[string]interface{}{
				"code":    "AUTHENTICATION_ERROR",
				"message": "Invalid or missing authentication token",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create request
			req := httptest.NewRequest("GET", "/api/v1/users/me", nil)
			req = tt.setupContext(req)

			// Create response recorder
			w := httptest.NewRecorder()

			// Call handler
			handler.GetProfile(w, req)

			// Check status code
			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			// Check content type
			contentType := w.Header().Get("Content-Type")
			if contentType != "application/json; charset=utf-8" {
				t.Errorf("Expected Content-Type 'application/json; charset=utf-8', got '%s'", contentType)
			}

			// Parse response body
			var response map[string]interface{}
			if err := json.NewDecoder(w.Body).Decode(&response); err != nil {
				t.Fatalf("Failed to decode response body: %v", err)
			}

			// Check response body
			for key, expectedValue := range tt.expectedBody {
				if actualValue, exists := response[key]; !exists {
					t.Errorf("Expected key '%s' in response, but it was missing", key)
				} else if actualValue != expectedValue {
					t.Errorf("Expected '%s' to be %v, got %v", key, expectedValue, actualValue)
				}
			}
		})
	}
}
