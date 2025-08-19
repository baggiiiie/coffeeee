package utils

import (
    "crypto/rand"
    "crypto/sha256"
    "encoding/hex"
)

// GenerateSalt returns a securely generated random salt of n bytes, hex-encoded.
func GenerateSalt(n int) (string, error) {
    b := make([]byte, n)
    if _, err := rand.Read(b); err != nil {
        return "", err
    }
    return hex.EncodeToString(b), nil
}

// HashPassword computes a SHA-256 hash of password+salt and returns hex string.
// Note: For production, consider a stronger KDF like scrypt/argon2.
func HashPassword(password, salt string) string {
    h := sha256.New()
    h.Write([]byte(password))
    h.Write([]byte(salt))
    sum := h.Sum(nil)
    return hex.EncodeToString(sum)
}

// VerifyPassword checks whether the provided password matches the stored hash and salt.
func VerifyPassword(password, salt, expectedHash string) bool {
    return HashPassword(password, salt) == expectedHash
}

