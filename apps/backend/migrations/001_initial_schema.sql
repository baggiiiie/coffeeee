-- Initial schema migration for Coffee Companion
-- Migration: 001_initial_schema.sql

-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Coffees table
CREATE TABLE coffees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    origin VARCHAR(100),
    roaster VARCHAR(255),
    description TEXT,
    photo_path VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Brew logs table
CREATE TABLE brew_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    coffee_id INTEGER NOT NULL,
    brew_method VARCHAR(100) NOT NULL,
    coffee_weight REAL,
    water_weight REAL,
    grind_size VARCHAR(50),
    water_temperature REAL,
    brew_time INTEGER, -- in seconds
    tasting_notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (coffee_id) REFERENCES coffees(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_coffees_roaster ON coffees(roaster);
CREATE INDEX idx_coffees_origin ON coffees(origin);
CREATE INDEX idx_brew_logs_user_id ON brew_logs(user_id);
CREATE INDEX idx_brew_logs_coffee_id ON brew_logs(coffee_id);
CREATE INDEX idx_brew_logs_created_at ON brew_logs(created_at);
CREATE INDEX idx_brew_logs_brew_method ON brew_logs(brew_method);

-- Triggers for updated_at timestamps
CREATE TRIGGER update_users_updated_at 
    AFTER UPDATE ON users
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_coffees_updated_at 
    AFTER UPDATE ON coffees
    BEGIN
        UPDATE coffees SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
