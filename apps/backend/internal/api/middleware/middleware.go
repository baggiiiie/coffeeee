package middleware

import (
	"coffee-companion/backend/internal/utils"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"
)

const authErrorCode = "AUTHENTICATION_ERROR"

// AuthMiddleware validates JWT from Authorization header and injects auth context
func AuthMiddleware(jwtSecret string) func(http.Handler) http.Handler {
	// NOTE: it's a higher-order function that returns a middleware function
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// TODO: Implement request logging middleware
		next.ServeHTTP(w, r)
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
