# Development Workflow

## Development Process

**Feature Development Flow:**
1. **Feature Planning** - Create feature branch from main
2. **Development** - Implement feature with tests
3. **Code Review** - Submit pull request for review
4. **Testing** - Automated tests and manual testing
5. **Merge** - Merge to main after approval
6. **Deploy** - Automated deployment to staging/production

**Branch Strategy:**
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Individual feature development
- `hotfix/*` - Critical bug fixes
- `release/*` - Release preparation

## Code Quality Standards

**TypeScript/JavaScript:**
- ESLint with Airbnb configuration
- Prettier for code formatting
- TypeScript strict mode enabled
- No unused variables or imports
- Consistent naming conventions

**Go:**
- `gofmt` for code formatting
- `golint` for linting
- `go vet` for static analysis
- `go mod tidy` for dependency management
- Consistent error handling patterns

**General Standards:**
- Meaningful commit messages (conventional commits)
- Comprehensive documentation
- Unit test coverage > 80%
- No TODO comments in production code

## Testing Strategy

## Testing Pyramid

**Unit Tests (70%):**
- Individual functions and methods
- Isolated component testing
- Fast execution (< 1 second)
- High coverage requirements

**Integration Tests (20%):**
- API endpoint testing
- Database integration
- Service layer testing
- External service mocking

**End-to-End Tests (10%):**
- Critical user workflows
- Cross-browser testing
- Performance testing
- Security testing

## Frontend Testing

**Unit Testing with Jest:**
```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { CoffeeCard } from './CoffeeCard';

describe('CoffeeCard', () => {
  const mockCoffee = {
    id: 1,
    name: 'Test Coffee',
    roaster: 'Test Roaster',
    origin: 'Test Origin'
  };

  it('renders coffee information correctly', () => {
    render(<CoffeeCard coffee={mockCoffee} />);
    
    expect(screen.getByText('Test Coffee')).toBeInTheDocument();
    expect(screen.getByText('Test Roaster')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const mockOnSelect = jest.fn();
    render(<CoffeeCard coffee={mockCoffee} onSelect={mockOnSelect} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockCoffee);
  });
});
```

**Custom Hook Testing:**
```typescript
// Hook test example
import { renderHook, act } from '@testing-library/react';
import { useCoffee } from './useCoffee';

describe('useCoffee', () => {
  it('fetches coffee data successfully', async () => {
    const { result } = renderHook(() => useCoffee(1));
    
    expect(result.current.loading).toBe(true);
    
    await act(async () => {
      await result.current.fetchCoffee();
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.coffee).toBeDefined();
  });
});
```

## Backend Testing

**Unit Testing with Go:**
```go
// Service test example
func TestCoffeeService_CreateCoffee(t *testing.T) {
    // Setup
    mockRepo := &MockCoffeeRepository{}
    service := NewCoffeeService(mockRepo)
    
    coffee := &models.Coffee{
        Name:     "Test Coffee",
        Roaster:  "Test Roaster",
        Origin:   "Test Origin",
    }
    
    // Expectations
    mockRepo.On("Create", mock.Anything, coffee).Return(nil)
    
    // Execute
    err := service.CreateCoffee(context.Background(), coffee)
    
    // Assert
    assert.NoError(t, err)
    mockRepo.AssertExpectations(t)
}
```

**API Integration Testing:**
```go
// API test example
func TestCoffeeAPI_CreateCoffee(t *testing.T) {
    // Setup test server
    router := setupTestRouter()
    
    // Test data
    coffeeData := map[string]interface{}{
        "name":    "Test Coffee",
        "roaster": "Test Roaster",
        "origin":  "Test Origin",
    }
    
    jsonData, _ := json.Marshal(coffeeData)
    
    // Execute request
    req := httptest.NewRequest("POST", "/api/v1/coffees", bytes.NewBuffer(jsonData))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer "+testToken)
    
    w := httptest.NewRecorder()
    router.ServeHTTP(w, req)
    
    // Assert response
    assert.Equal(t, http.StatusCreated, w.Code)
    
    var response map[string]interface{}
    json.Unmarshal(w.Body.Bytes(), &response)
    assert.Equal(t, "Test Coffee", response["name"])
}
```

## Database Testing

**Test Database Setup:**
```go
// Database test setup
func setupTestDB(t *testing.T) *sql.DB {
    db, err := sql.Open("sqlite3", ":memory:")
    require.NoError(t, err)
    
    // Run migrations
    err = runMigrations(db)
    require.NoError(t, err)
    
    // Seed test data
    err = seedTestData(db)
    require.NoError(t, err)
    
    return db
}

func TestCoffeeRepository_Create(t *testing.T) {
    db := setupTestDB(t)
    defer db.Close()
    
    repo := NewCoffeeRepository(db)
    
    coffee := &models.Coffee{
        Name:     "Test Coffee",
        Roaster:  "Test Roaster",
        Origin:   "Test Origin",
    }
    
    err := repo.Create(context.Background(), coffee)
    assert.NoError(t, err)
    assert.NotZero(t, coffee.ID)
}
```

## End-to-End Testing

**Playwright E2E Tests:**
```typescript
// E2E test example
import { test, expect } from '@playwright/test';

test('user can create a new brew log', async ({ page }) => {
  // Navigate to application
  await page.goto('http://localhost:3000');
  
  // Login
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');
  
  // Navigate to brew log form
  await page.click('[data-testid="new-brew-log"]');
  
  // Fill form
  await page.selectOption('[data-testid="coffee-select"]', '1');
  await page.fill('[data-testid="coffee-weight"]', '15');
  await page.fill('[data-testid="water-weight"]', '250');
  await page.selectOption('[data-testid="brew-method"]', 'V60');
  
  // Submit form
  await page.click('[data-testid="submit-brew-log"]');
  
  // Verify success
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

## Performance Testing

**Load Testing with Artillery:**
```yaml