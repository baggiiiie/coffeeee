-- Users table migration (down)
DROP TRIGGER IF EXISTS update_users_updated_at;
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_email;
DROP TABLE IF EXISTS users;

