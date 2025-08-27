-- name: GetAuthByEmail :one
SELECT id, username, password_hash, password_salt
FROM users
WHERE email = ?;

-- name: CreateUser :one
INSERT INTO users (username, email, password_hash, password_salt)
VALUES (?, ?, ?, ?)
RETURNING id;

-- name: GetUserProfileByID :one
SELECT username, email, created_at, updated_at
FROM users
WHERE id = ?;

-- name: FindUserIdByEmailExcludingID :one
SELECT id FROM users WHERE email = ? AND id != ?;

-- name: UpdateUserPartial :exec
UPDATE users
SET
  username = COALESCE(NULLIF(?, ''), username),
  email = COALESCE(NULLIF(?, ''), email)
WHERE id = ?;
