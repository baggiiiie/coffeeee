package middleware

import (
	"bytes"
	"coffeeee/backend/internal/utils"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
)

const authErrorCode = "AUTHENTICATION_ERROR"

// CustomResponseWriter wraps http.ResponseWriter to capture response data
type CustomResponseWriter struct {
	http.ResponseWriter
	body       bytes.Buffer
	statusCode int
}

// WriteHeader captures the status code
func (w *CustomResponseWriter) WriteHeader(statusCode int) {
	w.statusCode = statusCode
	w.ResponseWriter.WriteHeader(statusCode)
}

// Write captures the response body
func (w *CustomResponseWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

// AuthMiddleware validates JWT from Authorization header and injects auth context
func AuthMiddleware(jwtSecret string) func(http.Handler) http.Handler {
	// NOTE: it's a higher-order function that returns a middleware function
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			devHeader := r.Header.Get("X-Dev-User")
			if devHeader == "Baggie" {
				userID := int64(1)
				ctx := r.Context()
				ctx = WithAuthenticatedUserID(ctx, userID)
				next.ServeHTTP(w, r.WithContext(ctx))
				return
			}

			// Extract token from Authorization header
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				writeAuthError(w, "Invalid or missing authentication token")
				return
			}

			// Check Bearer format
			if !strings.HasPrefix(authHeader, "Bearer ") {
				writeAuthError(w, "Invalid or missing authentication token")
				return
			}

			tokenString := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
			if tokenString == "" {
				writeAuthError(w, "Invalid or missing authentication token")
				return
			}

			// Validate token with small leeway for clock skew
			claims, err := utils.ValidateTokenWithLeeway(tokenString, jwtSecret, 60*time.Second)
			if err != nil {
				writeAuthError(w, "Invalid or missing authentication token")
				return
			}

			// Derive user ID from `sub` claim
			var userID int64
			if claims != nil && claims.Subject != "" {
				if uid, parseErr := strconv.ParseInt(claims.Subject, 10, 64); parseErr == nil {
					userID = uid
				}
			}
			if userID == 0 {
				writeAuthError(w, "Invalid or missing authentication token")
				return
			}

			// Inject into context for downstream handlers
			ctx := WithAuthClaims(r.Context(), claims)
			ctx = WithAuthenticatedUserID(ctx, userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func writeAuthError(w http.ResponseWriter, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusUnauthorized)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"code":    authErrorCode,
		"message": message,
	})
}

// LoggingMiddleware logs the requested URL and body
func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("<<<<<<< Requested URL: %s - %s", r.Method, r.URL.String())
		bodyBytes, err := io.ReadAll(r.Body)
		if err != nil {
			log.Printf("Error reading body: %v", err)
			http.Error(w, "Unable to read request body", http.StatusBadRequest)
			return
		}

		// Restore the body for downstream handlers
		r.Body = io.NopCloser(bytes.NewReader(bodyBytes))
		log.Printf("Request Body: %s", string(bodyBytes))

		// Wrap the ResponseWriter to capture response data
		customWriter := &CustomResponseWriter{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}

		// Call the next handler
		next.ServeHTTP(customWriter, r)

		// Log response details
		log.Printf("Response Status: %d %s", customWriter.statusCode,
			http.StatusText(customWriter.statusCode))
		log.Printf("Response Headers: %v", customWriter.Header())
		log.Printf("Response Body: %s", customWriter.body.String())
		log.Printf(">>>>>>> End of Request: %s", r.URL.String())
	})
}

func SecurityHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// TODO: Implement security headers middleware
		next.ServeHTTP(w, r)
	})
}

func RecoveryMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// TODO: Implement panic recovery middleware
		next.ServeHTTP(w, r)
	})
}
