# Coding Standards

## General Principles

**Code Quality:**
- Write self-documenting code with clear naming
- Keep functions small and focused (max 20-30 lines)
- Follow the Single Responsibility Principle
- Use meaningful variable and function names
- Write code for maintainability, not cleverness

**Documentation:**
- Document all public APIs and interfaces
- Include usage examples in documentation
- Keep README files up to date
- Document complex business logic
- Use inline comments sparingly but effectively

## Go Coding Standards

**Naming Conventions:**
```go
// Package names: lowercase, single word
package coffee

// Function names: camelCase
func createCoffee(ctx context.Context, coffee *Coffee) error

// Variable names: camelCase
var coffeeWeight float64

// Constants: PascalCase
const MaxFileSize = 10 * 1024 * 1024

// Interface names: PascalCase with -er suffix
type CoffeeRepository interface {
    Create(ctx context.Context, coffee *Coffee) error
}

// Struct names: PascalCase
type Coffee struct {
    ID   int64  `json:"id"`
    Name string `json:"name"`
}
```

**Error Handling:**
```go
// Always check errors
if err != nil {
    return fmt.Errorf("failed to create coffee: %w", err)
}

// Use custom error types for business logic
type ValidationError struct {
    Field   string
    Message string
}

func (e ValidationError) Error() string {
    return fmt.Sprintf("validation error on %s: %s", e.Field, e.Message)
}
```

**Code Organization:**
```go
// File structure
package coffee

import (
    "context"
    "fmt"
    "time"
)

// Constants
const (
    MaxNameLength = 255
    MinNameLength = 1
)

// Types
type Coffee struct {
    ID          int64     `json:"id"`
    Name        string    `json:"name"`
    CreatedAt   time.Time `json:"created_at"`
}

// Functions
func NewCoffee(name string) *Coffee {
    return &Coffee{
        Name:      name,
        CreatedAt: time.Now(),
    }
}
```

## TypeScript/JavaScript Standards

**Naming Conventions:**
```typescript
// File names: kebab-case
// coffee-card.tsx

// Component names: PascalCase
export const CoffeeCard: React.FC<CoffeeCardProps> = ({ coffee }) => {
    // Component implementation
};

// Function names: camelCase
const fetchCoffee = async (id: number): Promise<Coffee> => {
    // Function implementation
};

// Variable names: camelCase
const coffeeWeight = 15.5;

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Interface names: PascalCase
interface CoffeeCardProps {
    coffee: Coffee;
    onSelect?: (coffee: Coffee) => void;
}
```

**Component Structure:**
```typescript
// Component file structure
import React from 'react';
import { Coffee } from '../types';

interface CoffeeCardProps {
    coffee: Coffee;
    onSelect?: (coffee: Coffee) => void;
}

export const CoffeeCard: React.FC<CoffeeCardProps> = ({ 
    coffee, 
    onSelect 
}) => {
    const handleClick = () => {
        onSelect?.(coffee);
    };

    return (
        <div className="coffee-card" onClick={handleClick}>
            <h3>{coffee.name}</h3>
            <p>{coffee.roaster}</p>
        </div>
    );
};
```

## Code Review Guidelines

**Review Checklist:**
- [ ] Code follows project standards
- [ ] Functions are small and focused
- [ ] Error handling is appropriate
- [ ] Tests are comprehensive
- [ ] Documentation is clear
- [ ] Performance considerations addressed
- [ ] Security implications considered

**Review Process:**
1. Automated checks (linting, tests) pass
2. Code review by at least one team member
3. Address all review comments
4. Final approval before merge

---