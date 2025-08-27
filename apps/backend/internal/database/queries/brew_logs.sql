-- name: GetCoffeeOwnerID :one
SELECT user_id FROM coffees WHERE id = ?;

-- name: CreateBrewLog :one
INSERT INTO brew_logs (
  user_id, coffee_id, brew_method, coffee_weight, water_weight, grind_size,
  water_temperature, brew_time, tasting_notes, rating
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
RETURNING id;

-- name: GetBrewLogByID :one
SELECT coffee_weight, water_weight, grind_size, water_temperature, brew_time,
       tasting_notes, rating, strftime('%Y-%m-%dT%H:%M:%fZ', created_at) AS created_at
FROM brew_logs
WHERE id = ?;
