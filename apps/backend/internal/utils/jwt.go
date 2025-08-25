package utils

import (
    "fmt"
    "strconv"
    "time"

    "github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID   int64  `json:"user_id"`
	Email    string `json:"email"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// GenerateToken creates a new JWT token for the given user
func GenerateToken(userID int64, email, username, secret string, expiry time.Duration) (string, error) {
	claims := Claims{
		UserID:   userID,
		Email:    email,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "coffeeee",
			Subject:   fmt.Sprintf("%d", userID),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// ValidateToken validates a JWT token and returns the claims
func ValidateToken(tokenString, secret string) (*Claims, error) {
    return ValidateTokenWithLeeway(tokenString, secret, 0)
}

// ValidateTokenWithLeeway validates a JWT token with configurable time leeway and returns the claims
func ValidateTokenWithLeeway(tokenString, secret string, leeway time.Duration) (*Claims, error) {
    // Restrict to HS256 and apply leeway for time-based claims
    token, err := jwt.ParseWithClaims(
        tokenString,
        &Claims{},
        func(token *jwt.Token) (interface{}, error) {
            if m, ok := token.Method.(*jwt.SigningMethodHMAC); !ok || m.Alg() != jwt.SigningMethodHS256.Alg() {
                return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
            }
            return []byte(secret), nil
        },
        jwt.WithLeeway(leeway),
        jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}),
    )

    if err != nil {
        return nil, err
    }

    if claims, ok := token.Claims.(*Claims); ok && token.Valid {
        // Enforce required claims presence: sub, exp, iat
        if claims.Subject == "" || claims.ExpiresAt == nil || claims.IssuedAt == nil {
            return nil, fmt.Errorf("missing required claims")
        }
        // Ensure sub is numeric user ID
        if _, err := strconv.ParseInt(claims.Subject, 10, 64); err != nil {
            return nil, fmt.Errorf("invalid subject claim")
        }
        return claims, nil
    }

    return nil, fmt.Errorf("invalid token")
}
