-- name: ListCoffeesForUser :many
SELECT 
    id, name, origin, roaster, description, photo_path, created_at, updated_at 
FROM coffees 
WHERE user_id = ? 
ORDER BY created_at DESC;

-- name: GetCoffeeByID :one
SELECT 
    id, user_id, name, origin, roaster, description, photo_path, created_at, updated_at 
FROM coffees 
WHERE id = ? AND user_id = ?;

-- name: FindCoffeeByUserAndDetails :one
SELECT id 
FROM coffees 
WHERE user_id = ? AND name = ? AND IFNULL(origin,'') = ? AND IFNULL(roaster,'') = ?;

-- name: CreateCoffee :one
INSERT INTO coffees (user_id, name, origin, roaster, description, photo_path) 
VALUES (?, ?, ?, ?, ?, ?) 
RETURNING id, user_id, name, origin, roaster, description, photo_path, created_at, updated_at;

-- name: UpdateCoffeePhotoPath :exec
UPDATE coffees 
SET photo_path = ? 
WHERE id = ? AND user_id = ?;

-- name: GetCoffeeByIDOnly :one
SELECT 
    origin, roaster, description, photo_path, created_at, updated_at 
FROM coffees 
WHERE id = ?;
