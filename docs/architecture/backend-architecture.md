# Backend Architecture

## Go Package Structure

```
cmd/
└── server/
    └── main.go

internal/
├── api/
│   ├── handlers/
│   │   ├── auth.go
│   │   ├── coffee.go
│   │   ├── brewlog.go
│   │   └── user.go
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── cors.go
│   │   ├── logging.go
│   │   └── validation.go
│   └── routes/
│       └── routes.go
├── models/
│   ├── user.go
│   ├── coffee.go
│   └── brewlog.go
├── services/
│   ├── auth_service.go
│   ├── coffee_service.go
│   ├── brewlog_service.go
│   └── ai_service.go
├── repository/
│   ├── user_repository.go
│   ├── coffee_repository.go
│   └── brewlog_repository.go
├── database/
│   ├── connection.go
│   └── migrations.go
├── config/
│   └── config.go
└── utils/
    ├── jwt.go
    ├── password.go
    ├── validation.go
    └── response.go

pkg/
├── shared/
│   └── types/
│       ├── user.go
│       ├── coffee.go
│       └── brewlog.go
└── ai/
    └── client.go
```

## Service Layer Architecture

**Service Interface Pattern:**
```go
type CoffeeService interface {
    CreateCoffee(ctx context.Context, coffee *models.Coffee) error
    GetCoffee(ctx context.Context, id int64) (*models.Coffee, error)
    ListCoffees(ctx context.Context, filters CoffeeFilters) ([]*models.Coffee, error)
    UpdateCoffee(ctx context.Context, id int64, coffee *models.Coffee) error
    DeleteCoffee(ctx context.Context, id int64) error
}
```

**Service Implementation:**
- Business logic encapsulation
- Transaction management
- Input validation
- Error handling and logging
- Integration with external services (AI)

## Repository Pattern

**Data Access Layer:**
- Abstract database operations
- SQL query management
- Connection pooling
- Transaction handling
- Data mapping between database and models

**Repository Interface:**
```go
type CoffeeRepository interface {
    Create(ctx context.Context, coffee *models.Coffee) error
    GetByID(ctx context.Context, id int64) (*models.Coffee, error)
    List(ctx context.Context, filters CoffeeFilters) ([]*models.Coffee, error)
    Update(ctx context.Context, coffee *models.Coffee) error
    Delete(ctx context.Context, id int64) error
}
```

## Middleware Stack

**Request Processing Pipeline:**
1. **CORS Middleware** - Handle cross-origin requests
2. **Logging Middleware** - Request/response logging
3. **Authentication Middleware** - JWT token validation
4. **Validation Middleware** - Request body validation
5. **Rate Limiting Middleware** - API rate limiting
6. **Recovery Middleware** - Panic recovery and error handling

## API Organization

**RESTful Endpoint Structure:**
```
/api/v1/
├── auth/
│   ├── POST /login
│   └── POST /register
├── users/
│   ├── GET /me
│   ├── PUT /me
│   ├── DELETE /me
│   └── coffees/
│       ├── GET /
│       └── POST /
├── coffees/
│   └── GET /{id}   (owner-only)
├── brewlogs/
│   ├── GET /
│   ├── POST /
│   ├── GET /{id}
│   ├── PUT /{id}
│   └── DELETE /{id}
└── ai/
    ├── POST /extract-coffee
    └── POST /recommendation
```

## Error Handling Strategy

**Structured Error Responses:**
```go
type APIError struct {
    Code    string `json:"code"`
    Message string `json:"message"`
    Details map[string]interface{} `json:"details,omitempty"`
}
```

**Error Categories:**
- **Validation Errors** (400) - Invalid input data
- **Authentication Errors** (401) - Invalid or missing credentials
- **Authorization Errors** (403) - Insufficient permissions
- **Not Found Errors** (404) - Resource not found
- **Internal Server Errors** (500) - Unexpected server errors

## Configuration Management

**Environment-Based Configuration:**
- Development, staging, and production environments
- Database connection strings
- AI service API keys
- JWT secret keys
- Server port and host settings

**Configuration Structure:**
```go
type Config struct {
    Server   ServerConfig
    Database DatabaseConfig
    AI       AIConfig
    JWT      JWTConfig
}
```

## Database Integration

**SQLite with GORM:**
- Object-relational mapping
- Automatic migrations
- Connection pooling
- Transaction support
- Query optimization

**Migration Strategy:**
- Version-controlled schema changes
- Automatic migration on startup
- Rollback capabilities
- Data seeding for development

---
