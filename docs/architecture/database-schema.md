# Database Schema

## SQLite Schema Definition

```sql
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
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    origin VARCHAR(100),
    roaster VARCHAR(255),
    description TEXT,
    photo_path VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
CREATE INDEX idx_coffees_user_id ON coffees(user_id);
CREATE INDEX idx_coffees_roaster ON coffees(roaster);
CREATE INDEX idx_coffees_origin ON coffees(origin);
-- Optional, non-unique composite index to support per-user find-or-create by name
CREATE INDEX idx_coffees_user_id_name ON coffees(user_id, name);
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
```

## Database Relationships

- **One-to-Many**: User → Coffees (each coffee is owned by exactly one user)
- **One-to-Many**: User → BrewLogs (one user can have many brew logs)
- **One-to-Many**: Coffee → BrewLogs (each coffee can have many brew logs from its owner)

## Data Integrity Constraints

- **User uniqueness**: Email and username must be unique across all users
- **Rating validation**: Brew log ratings must be between 1-5
- **Foreign key constraints**: Coffees must reference a valid owner user; brew logs must reference valid users and coffees
- **Cascade deletes**: When a user is deleted, all their coffees and brew logs are deleted
- **Cascade deletes**: When a coffee is deleted, all associated brew logs are deleted

---
