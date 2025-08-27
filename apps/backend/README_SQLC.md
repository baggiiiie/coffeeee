# SQLC Refactoring

This document describes the refactoring of SQL queries to use [sqlc](https://sqlc.dev/) for type-safe database operations.

## Overview

The coffee handler was refactored to use sqlc instead of raw SQL queries. This provides:

- **Type Safety**: Compile-time checking of SQL queries and generated Go code
- **Performance**: No runtime reflection or ORM overhead
- **Maintainability**: SQL queries are version-controlled and generate type-safe Go code
- **Developer Experience**: Better IDE support with autocomplete and error detection

## Structure

### SQL Queries
- `internal/database/queries/coffee.sql` - SQL queries for coffee operations
- `sqlc.yaml` - sqlc configuration file

### Generated Code
- `internal/database/sqlc/` - Auto-generated Go code from SQL queries
  - `models.go` - Database models
  - `coffee.sql.go` - Generated methods for coffee queries
  - `db.go` - Database interface and connection
  - `querier.go` - Query interface

### Service Layer
- `internal/services/coffee_service.go` - Business logic using sqlc queries

## Key Changes

### Before (Raw SQL)
```go
rows, err := h.db.Query(`SELECT id, name, origin, roaster, description, photo_path, created_at, updated_at FROM coffees WHERE user_id = ? ORDER BY created_at DESC`, userID)
// Manual row scanning and type conversion
```

### After (sqlc)
```go
coffees, err := h.queries.ListCoffeesForUser(ctx, userID)
// Type-safe, auto-generated code
```

## Usage

### Generate Code
```bash
make sqlc-generate
# or
cd apps/backend && sqlc generate
```

### Add New Queries
1. Add SQL query to `internal/database/queries/coffee.sql`
2. Run `make sqlc-generate`
3. Use generated methods in service layer

### Example Query
```sql
-- name: ListCoffeesForUser :many
SELECT 
    id, name, origin, roaster, description, photo_path, created_at, updated_at 
FROM coffees 
WHERE user_id = ? 
ORDER BY created_at DESC;
```

## Benefits

1. **Type Safety**: Compile-time validation of SQL queries
2. **Performance**: No ORM overhead, direct SQL execution
3. **Maintainability**: SQL and Go code are clearly separated
4. **Testing**: Easier to mock and test database operations
5. **Documentation**: SQL queries serve as documentation

## Migration Notes

- All existing functionality preserved
- API endpoints unchanged
- Tests updated to use new service layer
- Database schema unchanged
