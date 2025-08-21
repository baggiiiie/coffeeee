package middleware

import (
	"coffee-companion/backend/internal/utils"
	"context"
)

// contextKey is a private type to avoid collisions with other context keys.
//
// NOTE: it provides better type safety when storing/retrieving values from context.
// Without a custom type, a contextKey is just a string.
// someone may accidentally overwrite our contextKey if they happened to use the same string key.
// e.g., if someone try to store "authUserID", it overwrites our contextKeyAuthUserID.
type contextKey string

const (
	ctxKeyAuthClaims contextKey = "authClaims"
	ctxKeyAuthUserID contextKey = "authUserID"
)

// WithAuthClaims returns a new context carrying the JWT claims
func WithAuthClaims(ctx context.Context, claims *utils.Claims) context.Context {
	return context.WithValue(ctx, ctxKeyAuthClaims, claims)
}

// GetAuthClaims extracts JWT claims from context
func GetAuthClaims(ctx context.Context) (*utils.Claims, bool) {
	claims, ok := ctx.Value(ctxKeyAuthClaims).(*utils.Claims)
	return claims, ok
}

// WithAuthenticatedUserID returns a new context carrying the authenticated user ID
func WithAuthenticatedUserID(ctx context.Context, userID int64) context.Context {
	return context.WithValue(ctx, ctxKeyAuthUserID, userID)
}

// GetAuthenticatedUserID extracts the authenticated user ID from context
func GetAuthenticatedUserID(ctx context.Context) (int64, bool) {
	v := ctx.Value(ctxKeyAuthUserID)
	if v == nil {
		return 0, false
	}
	id, ok := v.(int64)
	return id, ok
}
