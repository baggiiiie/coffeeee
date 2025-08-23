package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	AI       AIConfig
	JWT      JWTConfig
}

type ServerConfig struct {
	Port           string
	Host           string
	Environment    string
	AllowedOrigins []string
	UploadPath     string
	MaxFileSize    int64
}

type DatabaseConfig struct {
	URL            string
	MigrationsPath string
}

type AIConfig struct {
	OpenAIAPIKey string
	GeminiAPIKey string
}

type JWTConfig struct {
	Secret string
	Expiry string
}

func Load() (*Config, error) {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		// Don't fail if .env doesn't exist
		fmt.Println("No .env file found, using environment variables")
	}

	config := &Config{
		Server: ServerConfig{
			Port:           getEnv("PORT", "8080"),
			Host:           getEnv("HOST", "0.0.0.0"),
			Environment:    getEnv("ENV", "development"),
			AllowedOrigins: getEnvSlice("ALLOWED_ORIGINS", []string{"http://localhost:3000"}),
			UploadPath:     getEnv("UPLOAD_PATH", "./uploads"),
			MaxFileSize:    getEnvAsInt64("MAX_FILE_SIZE", 10*1024*1024), // 10MB default
		},
		Database: DatabaseConfig{
			URL:            getEnv("DATABASE_URL", "./data/coffee.db"),
			MigrationsPath: getEnv("DATABASE_MIGRATIONS_PATH", "./migrations"),
		},
		AI: AIConfig{
			OpenAIAPIKey: getEnv("OPENAI_API_KEY", ""),
			GeminiAPIKey: getEnv("GEMINI_API_KEY", ""),
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", "your-super-secret-jwt-key-change-this-in-production"),
			Expiry: getEnv("JWT_EXPIRY", "24h"),
		},
	}

	return config, nil
}

func (c *Config) DatabaseURL() string {
	return c.Database.URL
}

func (c *Config) Port() string {
	return c.Server.Port
}

func (c *Config) IsDevelopment() bool {
	return c.Server.Environment == "development"
}

// Helper functions
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt64(key string, defaultValue int64) int64 {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.ParseInt(value, 10, 64); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvSlice(key string, defaultValue []string) []string {
	if value := os.Getenv(key); value != "" {
		// Simple comma-separated values
		// In production, you might want more sophisticated parsing
		rawParts := strings.Split(value, ",")
		parts := make([]string, 0, len(rawParts))
		for _, part := range rawParts {
			trimmed := strings.TrimSpace(part)
			if trimmed != "" {
				parts = append(parts, trimmed)
			}
		}
		return parts
	}
	return defaultValue
}
