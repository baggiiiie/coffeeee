# Components

This section breaks down the high-level components of the system.

## Backend Components (Services)
*   **UserService:** Handles user creation, profile management, and authentication logic.
*   **CoffeeService:** Manages the master list of coffees (creating, updating, listing).
*   **BrewLogService:** Handles the creation, retrieval, and management of user brew logs.
*   **AuthService:** Manages JWT token generation and validation.

## Frontend Components (Pages/Views)
*   **HomePage:** The main landing page for authenticated users, possibly showing a dashboard of their recent brew logs.
*   **LoginPage:** A page for users to log in.
*   **SignUpPage:** A page for new users to register.
*   **CoffeeListPage:** A view to browse and search all available coffees.
*   **CoffeeDetailPage:** A view showing the details of a single coffee and all associated brew logs from the community.
*   **BrewLogForm:** A form for creating and editing a brew log.
*   **UserProfilePage:** A page for users to view and edit their profile.

---