# Frontend Architecture

## React Component Hierarchy

```
App
├── Router
│   ├── Public Routes
│   │   ├── LandingPage
│   │   ├── LoginPage
│   │   └── SignUpPage
│   └── Protected Routes
│       ├── Dashboard
│       │   ├── RecentBrewLogs
│       │   ├── CoffeeGallery
│       │   └── QuickActions
│       ├── CoffeeListPage
│       │   ├── CoffeeCard
│       │   ├── SearchFilters
│       │   └── Pagination
│       ├── CoffeeDetailPage
│       │   ├── CoffeeInfo
│       │   ├── BrewLogList
│       │   └── AddBrewLogButton
│       ├── BrewLogForm
│       │   ├── CoffeeSelector
│       │   ├── BrewingParameters
│       │   ├── AITastingAssistant
│       │   └── RatingInput
│       ├── BrewingGuidesPage
│       │   ├── GuideCard
│       │   └── GuideDetail
│       └── UserProfilePage
│           ├── ProfileForm
│           └── AccountSettings
├── Common Components
│   ├── Header
│   ├── Navigation
│   ├── LoadingSpinner
│   ├── ErrorBoundary
│   └── ToastNotifications
└── Context Providers
    ├── AuthContext
    ├── CoffeeContext
    └── ThemeContext
```

## State Management Strategy

**React Context for Global State:**
- **AuthContext**: User authentication state, login/logout functions
- **CoffeeContext**: Coffee data caching, search filters, pagination state
- **ThemeContext**: UI theme preferences, dark/light mode

**Local State for Component-Specific Data:**
- Form inputs and validation state
- UI interactions (modals, dropdowns, etc.)
- Component-specific data that doesn't need to be shared

**State Persistence:**
- Authentication tokens stored in localStorage
- User preferences in localStorage
- Coffee data cached in memory with periodic refresh

## Routing Strategy

**Public Routes:**
- `/` - Landing page
- `/login` - User login
- `/signup` - User registration

**Protected Routes (require authentication):**
- `/dashboard` - Main user dashboard
- `/coffees` - Browse all coffees
- `/coffees/:id` - Coffee detail page
- `/brew-logs/new` - Create new brew log
- `/brew-logs/:id` - View/edit brew log
- `/guides` - Brewing guides
- `/profile` - User profile and settings

**Route Guards:**
- Authentication check on protected routes
- Redirect to login if not authenticated
- Redirect to dashboard after successful login

## Component Design Patterns

**Container/Presentational Pattern:**
- Container components handle data fetching and state management
- Presentational components focus on UI rendering
- Clear separation of concerns

**Compound Components:**
- Form components with reusable field components
- Modal components with flexible content
- Card components with optional actions

**Custom Hooks:**
- `useAuth()` - Authentication state and functions
- `useCoffee()` - Coffee data fetching and caching
- `useBrewLog()` - Brew log operations
- `useAI()` - AI service integration
- `useForm()` - Form state management and validation

## Styling Architecture

**Material-UI (MUI) Integration:**
- Use MUI components as the foundation
- Custom theme with coffee-inspired color palette
- Responsive design using MUI's breakpoint system

**CSS-in-JS with Emotion:**
- Component-specific styles co-located with components
- Dynamic styling based on props and state
- Consistent design tokens and spacing

**Responsive Design:**
- Mobile-first approach
- Breakpoints: xs (0px), sm (600px), md (900px), lg (1200px), xl (1536px)
- Touch-friendly interactions for mobile devices

## Performance Optimization

**Code Splitting:**
- Route-based code splitting using React.lazy()
- Component-level lazy loading for heavy components
- Dynamic imports for non-critical features

**Memoization:**
- React.memo() for expensive components
- useMemo() for expensive calculations
- useCallback() for function references

**Data Fetching:**
- Implement request deduplication
- Cache API responses in memory
- Optimistic updates for better UX

---