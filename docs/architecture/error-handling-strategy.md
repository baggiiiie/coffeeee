# Error Handling Strategy

## Error Classification

**Error Types:**
1. **Validation Errors** - Invalid input data
2. **Authentication Errors** - Invalid credentials
3. **Authorization Errors** - Insufficient permissions
4. **Not Found Errors** - Resource doesn't exist
5. **Business Logic Errors** - Domain-specific errors
6. **System Errors** - Unexpected technical failures

## Backend Error Handling

**Structured Error Responses:**
```go
type APIError struct {
    Code       string                 `json:"code"`
    Message    string                 `json:"message"`
    Details    map[string]interface{} `json:"details,omitempty"`
    Timestamp  time.Time              `json:"timestamp"`
    RequestID  string                 `json:"request_id,omitempty"`
}

type ErrorCode string

const (
    ErrorCodeValidation     ErrorCode = "VALIDATION_ERROR"
    ErrorCodeAuthentication ErrorCode = "AUTHENTICATION_ERROR"
    ErrorCodeAuthorization  ErrorCode = "AUTHORIZATION_ERROR"
    ErrorCodeNotFound       ErrorCode = "NOT_FOUND"
    ErrorCodeInternal       ErrorCode = "INTERNAL_ERROR"
)
```

**Error Middleware:**
```go
func errorHandler(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if err := recover(); err != nil {
                log.Printf("Panic: %v", err)
                respondWithError(w, ErrorCodeInternal, "Internal server error", http.StatusInternalServerError)
            }
        }()
        
        next.ServeHTTP(w, r)
    })
}

func respondWithError(w http.ResponseWriter, code ErrorCode, message string, statusCode int) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(statusCode)
    
    error := APIError{
        Code:      string(code),
        Message:   message,
        Timestamp: time.Now(),
    }
    
    json.NewEncoder(w).Encode(error)
}
```

**Service Layer Error Handling:**
```go
func (s *CoffeeService) CreateCoffee(ctx context.Context, coffee *Coffee) error {
    // Validation
    if err := s.validateCoffee(coffee); err != nil {
        return &ValidationError{Field: "coffee", Message: err.Error()}
    }
    
    // Business logic
    if err := s.repo.Create(ctx, coffee); err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            return &NotFoundError{Resource: "coffee"}
        }
        return fmt.Errorf("failed to create coffee: %w", err)
    }
    
    return nil
}
```

## Frontend Error Handling

**Error Boundary:**
```typescript
class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error?: Error }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        // Send to error reporting service
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback error={this.state.error} />;
        }

        return this.props.children;
    }
}
```

**API Error Handling:**
```typescript
const useApiError = () => {
    const [error, setError] = useState<APIError | null>(null);

    const handleError = (err: any) => {
        if (err.response?.data) {
            setError(err.response.data);
        } else {
            setError({
                code: 'NETWORK_ERROR',
                message: 'Network error occurred',
                timestamp: new Date().toISOString()
            });
        }
    };

    return { error, handleError, clearError: () => setError(null) };
};
```

## Logging Strategy

**Structured Logging:**
```go
type LogEntry struct {
    Level     string                 `json:"level"`
    Message   string                 `json:"message"`
    Timestamp time.Time              `json:"timestamp"`
    RequestID string                 `json:"request_id,omitempty"`
    UserID    string                 `json:"user_id,omitempty"`
    Fields    map[string]interface{} `json:"fields,omitempty"`
}

func logError(ctx context.Context, err error, fields map[string]interface{}) {
    entry := LogEntry{
        Level:     "error",
        Message:   err.Error(),
        Timestamp: time.Now(),
        Fields:    fields,
    }
    
    if requestID := ctx.Value("request_id"); requestID != nil {
        entry.RequestID = requestID.(string)
    }
    
    if userID := ctx.Value("user_id"); userID != nil {
        entry.UserID = userID.(string)
    }
    
    logJSON, _ := json.Marshal(entry)
    log.Println(string(logJSON))
}
```

---