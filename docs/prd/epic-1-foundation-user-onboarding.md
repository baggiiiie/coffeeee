# Epic 1: Foundation & User Onboarding

**Expanded Goal:** The goal of this epic is to establish the technical foundation of the project and deliver the first piece of tangible user value: the ability to create an account and log in. By the end of this epic, we will have a secure, deployable web application with a basic user management system, ready for the core features to be built upon.

---

### Story 1.1: Project Setup & "Hello World"
*   **As a** developer,
*   **I want** to set up the monorepo with the React frontend and Go backend projects, and a simple CI/CD pipeline,
*   **so that** I have a stable foundation for development and a clear path to deployment.
*   **Acceptance Criteria:**
    1.  A new Git repository is created.
    2.  The repository contains `frontend` and `backend` directories.
    3.  The `frontend` directory contains a basic React application.
    4.  The `backend` directory contains a basic Go application with an HTTP server.
    5.  The backend exposes a `/health` endpoint that returns a `200 OK` status.
    6.  A basic CI/CD pipeline (e.g., using GitHub Actions) is configured to run on every push.

---

### Story 1.2: Database Setup & User Model
*   **As a** developer,
*   **I want** to set up the SQLite database and create the database schema for the `users` table,
*   **so that** I can store and manage user information securely.
*   **Acceptance Criteria:**
    1.  The Go backend can connect to a SQLite database file.
    2.  A database migration tool is added to the project.
    3.  A new migration is created for the `users` table with columns for `id`, `email`, `password_hash`, etc.
    4.  The migration can be applied and rolled back successfully.

---

### Story 1.3: User Registration
*   **As a** new user,
*   **I want** to be able to create a new account using my email and a password,
*   **so that** I can start using the application.
*   **Acceptance Criteria:**
    1.  The frontend has a registration page with email and password fields.
    2.  The backend exposes a `/register` endpoint.
    3.  The user's password is securely hashed before being stored in the database.
    4.  The system prevents registration with an email address that is already in use.
    5.  Upon successful registration, the user is redirected to the login page.

---

### Story 1.4: User Login & Authentication
*   **As a** registered user,
*   **I want** to be able to log in to my account,
*   **so that** I can access the application's features.
*   **Acceptance Criteria:**
    1.  The frontend has a login page.
    2.  The backend exposes a `/login` endpoint that authenticates the user.
    3.  Upon successful login, the backend returns a JWT (JSON Web Token).
    4.  The frontend stores the JWT securely and uses it for subsequent requests.
    5.  After logging in, the user is redirected to a simple, authenticated "dashboard" page.
