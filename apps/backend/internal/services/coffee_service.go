package services

import (
	db "coffeeee/backend/internal/database/sqlc"
	"context"
	"database/sql"
	"strings"
	"time"
)

type CoffeeService struct {
	queries *db.Queries
}

func NewCoffeeService(queries *db.Queries) *CoffeeService {
	return &CoffeeService{
		queries: queries,
	}
}

type CoffeeOutput struct {
	ID          int64   `json:"id"`
	Name        string  `json:"name"`
	Origin      *string `json:"origin,omitempty"`
	Roaster     *string `json:"roaster,omitempty"`
	Description *string `json:"description,omitempty"`
	PhotoPath   *string `json:"photoPath,omitempty"`
	CreatedAt   string  `json:"createdAt"`
	UpdatedAt   string  `json:"updatedAt"`
}

type CreateCoffeeInput struct {
	UserID      int64   `json:"user_id"`
	Name        string  `json:"name"`
	Origin      *string `json:"origin,omitempty"`
	Roaster     *string `json:"roaster,omitempty"`
	Description *string `json:"description,omitempty"`
	PhotoPath   *string `json:"photoPath,omitempty"`
}

// GetForUserByID returns a single coffee owned by the given user.
func (s *CoffeeService) GetForUserByID(ctx context.Context, coffeeID int64, userID int64) (*CoffeeOutput, error) {
	row, err := s.queries.GetCoffeeByID(ctx, db.GetCoffeeByIDParams{ID: coffeeID, UserID: userID})
	if err != nil {
		return nil, err
	}

	out := &CoffeeOutput{
		ID:        row.ID,
		Name:      row.Name,
		CreatedAt: row.CreatedAt.Format(time.RFC3339),
		UpdatedAt: row.UpdatedAt.Format(time.RFC3339),
	}
	if row.Origin.Valid {
		v := row.Origin.String
		out.Origin = &v
	}
	if row.Roaster.Valid {
		v := row.Roaster.String
		out.Roaster = &v
	}
	if row.Description.Valid {
		v := row.Description.String
		out.Description = &v
	}
	if row.PhotoPath.Valid {
		v := row.PhotoPath.String
		out.PhotoPath = &v
	}
	return out, nil
}

func (s *CoffeeService) ListForUser(ctx context.Context, userID int64) ([]CoffeeOutput, error) {
	coffees, err := s.queries.ListCoffeesForUser(ctx, userID)
	if err != nil {
		return nil, err
	}

	var result []CoffeeOutput
	for _, coffee := range coffees {
		output := CoffeeOutput{
			ID:        coffee.ID,
			Name:      coffee.Name,
			CreatedAt: coffee.CreatedAt.Format(time.RFC3339),
			UpdatedAt: coffee.UpdatedAt.Format(time.RFC3339),
		}

		if coffee.Origin.Valid {
			output.Origin = &coffee.Origin.String
		}
		if coffee.Roaster.Valid {
			output.Roaster = &coffee.Roaster.String
		}
		if coffee.Description.Valid {
			output.Description = &coffee.Description.String
		}
		if coffee.PhotoPath.Valid {
			output.PhotoPath = &coffee.PhotoPath.String
		}

		result = append(result, output)
	}

	return result, nil
}

func (s *CoffeeService) CreateForUser(ctx context.Context, input CreateCoffeeInput) (*CoffeeOutput, error) {
	// Validate input
	name := strings.TrimSpace(input.Name)
	if name == "" || len(name) > 255 {
		return nil, &ValidationError{Message: "name is required and must be <= 255 characters"}
	}

	var origin, roaster, description, photoPath sql.NullString

	if input.Origin != nil {
		originStr := strings.TrimSpace(*input.Origin)
		if len(originStr) > 100 {
			return nil, &ValidationError{Message: "origin must be <= 100 characters"}
		}
		if originStr != "" {
			origin.String = originStr
			origin.Valid = true
		}
	}

	if input.Roaster != nil {
		roasterStr := strings.TrimSpace(*input.Roaster)
		if len(roasterStr) > 255 {
			return nil, &ValidationError{Message: "roaster must be <= 255 characters"}
		}
		if roasterStr != "" {
			roaster.String = roasterStr
			roaster.Valid = true
		}
	}

	if input.Description != nil {
		descStr := strings.TrimSpace(*input.Description)
		if descStr != "" {
			description.String = descStr
			description.Valid = true
		}
	}

	if input.PhotoPath != nil {
		photoStr := strings.TrimSpace(*input.PhotoPath)
		if len(photoStr) > 500 {
			return nil, &ValidationError{Message: "photoPath must be <= 500 characters"}
		}
		if photoStr != "" {
			photoPath.String = photoStr
			photoPath.Valid = true
		}
	}

	// Check if coffee already exists
	params := db.FindCoffeeByUserAndDetailsParams{
		UserID:  input.UserID,
		Name:    name,
		Origin:  origin,
		Roaster: roaster,
	}

	existingID, err := s.queries.FindCoffeeByUserAndDetails(ctx, params)
	if err == nil {
		// Coffee exists, update photo path if provided
		if photoPath.Valid {
			updateParams := db.UpdateCoffeePhotoPathParams{
				PhotoPath: photoPath,
				ID:        existingID,
				UserID:    input.UserID,
			}
			if err := s.queries.UpdateCoffeePhotoPath(ctx, updateParams); err != nil {
				return nil, err
			}
		}

		// Get the updated coffee
		coffee, err := s.queries.GetCoffeeByIDOnly(ctx, existingID)
		if err != nil {
			return nil, err
		}

		return s.convertToOutput(existingID, name, coffee), nil
	}

	// Create new coffee
	createParams := db.CreateCoffeeParams{
		UserID:      input.UserID,
		Name:        name,
		Origin:      origin,
		Roaster:     roaster,
		Description: description,
		PhotoPath:   photoPath,
	}

	coffee, err := s.queries.CreateCoffee(ctx, createParams)
	if err != nil {
		return nil, err
	}

	return s.convertToOutput(coffee.ID, coffee.Name, db.GetCoffeeByIDOnlyRow{
		Origin:      coffee.Origin,
		Roaster:     coffee.Roaster,
		Description: coffee.Description,
		PhotoPath:   coffee.PhotoPath,
		CreatedAt:   coffee.CreatedAt,
		UpdatedAt:   coffee.UpdatedAt,
	}), nil
}

func (s *CoffeeService) convertToOutput(id int64, name string, coffee db.GetCoffeeByIDOnlyRow) *CoffeeOutput {
	output := &CoffeeOutput{
		ID:        id,
		Name:      name,
		CreatedAt: coffee.CreatedAt.Format(time.RFC3339),
		UpdatedAt: coffee.UpdatedAt.Format(time.RFC3339),
	}

	if coffee.Origin.Valid {
		output.Origin = &coffee.Origin.String
	}
	if coffee.Roaster.Valid {
		output.Roaster = &coffee.Roaster.String
	}
	if coffee.Description.Valid {
		output.Description = &coffee.Description.String
	}
	if coffee.PhotoPath.Valid {
		output.PhotoPath = &coffee.PhotoPath.String
	}

	return output
}

type ValidationError struct {
	Message string
}

func (e *ValidationError) Error() string {
	return e.Message
}
