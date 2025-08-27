// Package database provides utilities for handling database connections
package database

import (
	db "coffeeee/backend/internal/database/sqlc"
	"database/sql"

	_ "github.com/mattn/go-sqlite3"
)

func Connect(databaseURL string) (*sql.DB, error) {
	db, err := sql.Open("sqlite3", databaseURL)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	return db, nil
}

// NewQueries creates a new Queries instance from a database connection
func NewQueries(dbConn *sql.DB) *db.Queries {
	return db.New(dbConn)
}
