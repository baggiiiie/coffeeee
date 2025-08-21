-- User-Coffees join table (per-user collection linking)
CREATE TABLE IF NOT EXISTS user_coffees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    coffee_id INTEGER NOT NULL,
    photo_path VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (coffee_id) REFERENCES coffees(id) ON DELETE CASCADE
);

-- Ensure uniqueness: a user can link to a given coffee only once
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_coffees_unique ON user_coffees(user_id, coffee_id);

