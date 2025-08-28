# The Coffeeee Product Requirements Document (PRD)

## Goals and Background Context

### Goals
*   Create an engaging web application that makes learning about coffee fun and accessible for both beginners and enthusiasts.
*   Develop a core set of MVP features, including pour-over guides, AI-assisted brew logs, a coffee journey log, and an AI recommendation engine.
*   Launch the MVP within 6 months as a one-person project.
*   Provide a solid foundation for future development, including expanded brewing methods, community features, and native mobile apps.

### Background Context
This project was initiated to address the problem that learning about specialty coffee is often a frustrating and intimidating experience. The current landscape of online resources is fragmented and lacks a structured, engaging learning path, which can cause enthusiasts to lose the joy of their hobby.

The "Coffeeee" app aims to solve this by providing a centralized, fun, and interactive platform for coffee education. This Product Requirements Document (PRD) will build upon the foundational Project Brief to define the specific functional and non-functional requirements for the development of the MVP.

### Change Log
| Date       | Version | Description                | Author |
| :--------- | :------ | :------------------------- | :----- |
| 2025-08-17 | 1.0     | Initial draft of the PRD. | John   |

## Requirements

### Functional Requirements
*   **FR1:** A user must be able to create a new account using an email and password.
*   **FR2:** A user must be able to log in and log out of their account.
*   **FR3:** The app must display a list of available pour-over brewing guides.
*   **FR4:** When a user selects a guide, the app must display a step-by-step tutorial.
*   **FR5:** A user must be able to upload a photo of a coffee bag to their personal log.
*   **FR6:** The app must use an AI service to attempt to automatically extract text from the uploaded photo.
*   **FR7:** A user must be able to manually add or edit the details of a coffee in their log.
*   **FR8:** The app must display all logged coffees in a personal gallery view.
*   **FR9:** A user must be able to start a new brew log entry for a specific coffee.
*   **FR10:** A user must be able to record brewing parameters (e.g., grind size, water temp, ratio).
*   **FR11:** The app must provide AI-powered prompts to help the user describe the taste of their brew.
*   **FR12:** A user must be able to save their brew log.
*   **FR13:** A user must be able to view a history of all brew logs for a specific coffee.
*   **FR14:** A user must be able to request a recommendation for their next brew.
*   **FR15:** The user must be able to specify their preference for the next brew (e.g., "more sweetness").
*   **FR16:** The app must use an AI service to suggest a single, specific change to a brewing parameter.

### Non-Functional Requirements
*   **NFR1:** The web application must be responsive and usable on both desktop and mobile web browsers.
*   **NFR2:** All user data must be stored securely.
*   **NFR3:** The application should be intuitive and easy to navigate for both of our target personas.
*   **NFR4:** The AI-powered features must provide a response within 3-5 seconds.
*   **NFR5:** The application will be developed in English only for the MVP.

## User Interface Design Goals

### Overall UX Vision
The user experience should be clean, calming, and encouraging. It should feel like a beautiful, well-crafted tool that is a pleasure to use. The design should be minimalist, with a focus on typography and visual clarity, avoiding clutter. The tone should be supportive and friendly, making the user feel like they have a companion on their coffee journey.

### Key Interaction Paradigms
*   **Guided Flows:** Key tasks, like logging a new brew, will be broken down into simple, step-by-step processes to avoid overwhelming the user.
*   **Progressive Disclosure:** The app will only show information as it's needed, keeping the interface clean and focused.
*   **Clear Visual Feedback:** The app will provide clear and immediate feedback for user actions.

### Core Screens and Views
This is a conceptual list of the essential screens needed for the MVP:
*   **Dashboard/Home:** A central hub to see recent activity and start common tasks.
*   **Brewing Guides:** A library of the pour-over guides.
*   **Brew Log Form:** A dedicated screen for logging a new brew.
*   **Coffee Gallery:** A visual log of all the coffees a user has tried.
*   **Coffee Detail Page:** A view of a specific coffee and its brew history.
*   **User Profile & Settings:** A simple page for account management.

### Accessibility
*   **WCAG AA:** This is a standard for accessibility that ensures the app is usable by people with disabilities. I've assumed this is a good starting point.

### Branding
*   *Assumption:* Since we don't have a brand yet, I'm assuming a clean, modern aesthetic with a warm and inviting color palette (e.g., earthy tones) that reflects the craft of specialty coffee.

### Target Device and Platforms
*   **Web Responsive:** As we decided earlier, the app must work beautifully on both desktop and mobile web browsers.

## Technical Assumptions

### Repository Structure: Monorepo
*   **Recommendation:** We will use a **Monorepo**, which means a single repository will contain the code for both the frontend (React) and the backend (Go).
*   **Rationale:** For a solo developer, this is often much simpler to set up and manage than juggling multiple repositories.

### Service Architecture: Monolith
*   **Recommendation:** We will use a **Monolithic** architecture for the backend. This means all the backend logic will be in a single, unified application.
*   **Rationale:** This is the simplest and fastest approach for an MVP. It avoids the operational complexity of microservices, which is unnecessary at this stage.

### Testing Requirements: Unit + Integration
*   **Recommendation:** We will aim for a combination of **Unit Tests** (testing small, individual pieces of code) and **Integration Tests** (testing how different parts of the app work together).
*   **Rationale:** This provides a good balance of confidence and effort for an MVP. A full end-to-end (E2E) testing suite can be added later if needed.

### Additional Technical Assumptions
*   The application will be built using **React, Go, and SQLite**, as we decided earlier.
*   A third-party AI API will be required for the smart features. The specific choice of API will be determined during development.

## Epic List

### Epic 1: Foundation & User Onboarding
*   **Goal:** To set up the core project infrastructure (repository, database, CI/CD) and implement basic user account creation and login functionality. This epic delivers a secure foundation and the first point of interaction for a user.

### Epic 2: Coffee & Brew Logging
*   **Goal:** To implement the core data-logging features of the app, allowing users to log the coffees they've tried (the "Journey Log") and the details of each brew they make (the "Brew Log"). This epic delivers the primary data entry functionality.

### Epic 3: Learning & Guidance
*   **Goal:** To build the educational and guidance features, including the pour-over brewing guides and the AI-powered recommendation engine. This epic delivers the "smart" features that make our app unique.

## Epic 1: Foundation & User Onboarding

**Expanded Goal:** The goal of this epic is to establish the technical foundation of the project and deliver the first piece of tangible user value: the ability to create an account and log in. By the end of this epic, we will have a secure, deployable web application with a basic user management system, ready for the core features to be built upon.

---

#### Story 1.1: Project Setup & "Hello World"
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

#### Story 1.2: Database Setup & User Model
*   **As a** developer,
*   **I want** to set up the SQLite database and create the database schema for the `users` table,
*   **so that** I can store and manage user information securely.
*   **Acceptance Criteria:**
    1.  The Go backend can connect to a SQLite database file.
    2.  A database migration tool is added to the project.
    3.  A new migration is created for the `users` table with columns for `id`, `email`, `password_hash`, etc.
    4.  The migration can be applied and rolled back successfully.

---

#### Story 1.3: User Registration
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

#### Story 1.4: User Login & Authentication
*   **As a** registered user,
*   **I want** to be able to log in to my account,
*   **so that** I can access the application's features.
*   **Acceptance Criteria:**
    1.  The frontend has a login page.
    2.  The backend exposes a `/login` endpoint that authenticates the user.
    3.  Upon successful login, the backend returns a JWT (JSON Web Token).
    4.  The frontend stores the JWT securely and uses it for subsequent requests.
    5.  After logging in, the user is redirected to a simple, authenticated "dashboard" page.

## Epic 2: Coffee & Brew Logging

**Expanded Goal:** The goal of this epic is to deliver the core data-logging functionality of the application. Users will be able to create a beautiful, visual log of the coffees they have tried and meticulously record the parameters and tasting notes for each brew they make. This epic provides the foundational data that will be used by the AI recommendation engine in the next epic.

---

#### Story 2.1: Create Coffee "Journey" Log
*   **As a** logged-in user,
*   **I want** to add a new coffee to my personal collection by uploading a photo of the bag and adding details,
*   **so that** I can keep a record of all the coffees I have tried.
*   **Acceptance Criteria:**
    1.  The authenticated dashboard has a button to "Add New Coffee."
    2.  The "Add New Coffee" page has fields for coffee name, roaster, origin, etc., and a file upload for the bag photo.
    3.  The backend has an endpoint to create a new coffee entry in the database, associated with the logged-in user.
    4.  (Stretch Goal) The backend sends the uploaded photo to an AI service to attempt to extract text and pre-fill the form fields.

---

#### Story 2.2: View Coffee Gallery
*   **As a** logged-in user,
*   **I want** to see all the coffees I have logged in a visually appealing gallery,
*   **so that** I can easily browse my coffee history.
*   **Acceptance Criteria:**
    1.  The dashboard links to a "My Coffees" page.
    2.  The "My Coffees" page displays a grid of cards, each showing the photo and name of a logged coffee.
    3.  Clicking on a coffee card navigates the user to the detail page for that coffee.

---

#### Story 2.3: Create Brew Log
*   **As a** logged-in user,
*   **I want** to start a new brew log for a specific coffee from my collection,
*   **so that** I can record the details of my brew.
*   **Acceptance Criteria:**
    1.  The Coffee Detail Page has a "Log New Brew" button.
    2.  The "Log New Brew" page has input fields for all the required brewing parameters (grind size, water temp, ratio, etc.).
    3.  The backend has an endpoint to create a new brew log entry, associated with the specific coffee.
    4.  Upon saving, the user is redirected back to the Coffee Detail Page.

---

#### Story 2.4 (Revised): AI-Guided Tasting Experience
*   **As a** logged-in user,
*   **I want** the app to ask me guiding questions about what I'm tasting,
*   **so that** I can learn to identify and describe the flavors in my coffee myself.
*   **Acceptance Criteria:**
    1.  The tasting notes section of the "Log New Brew" page has an "AI Tasting Guide" button.
    2.  When clicked, the AI guide initiates an interactive, step-by-step process.
    3.  The guide asks a series of questions to prompt the user to think about specific aspects of the taste (e.g., "First, let's focus on the sweetness. Do you taste more of a fruit sweetness, like apple, or more of a sugar sweetness, like honey?").
    4.  Based on the user's answers (e.g., clicking on "Fruit Sweetness"), the guide might ask a follow-up question (e.g., "Great. Is that a crisp fruit like an apple, or a soft fruit like a peach?").
    5.  The user's answers are used to help them build their own tasting notes; the app facilitates their description rather than generating it for them.
    6.  The process is designed to be educational, teaching the user the vocabulary and methodology of coffee tasting in an interactive way.

---

#### Story 2.5: View Brew History
*   **As a** logged-in user,
*   **I want** to see a history of all the brews I have logged for a specific coffee,
*   **so that** I can track my progress and see how my brew variables have changed over time.
*   **Acceptance Criteria:**
    1.  The Coffee Detail Page displays a list of all brew logs associated with that coffee.
    2.  Each item in the list shows key information like the date and the main tasting notes.
    3.  The user can click on a brew log to see its full details.

## Epic 3: Learning & Guidance

**Expanded Goal:** The goal of this epic is to build the core educational and "smart" features of the application. By the end of this epic, users will not only be able to log their data but will also receive guidance on how to brew better coffee and learn from structured content, fulfilling our promise of being a true Coffeeee.

---

#### Story 3.1: View Brewing Guides
*   **As a** logged-in user,
*   **I want** to browse and view a library of pour-over brewing guides,
*   **so that** I can learn the correct techniques for different brewers.
*   **Acceptance Criteria:**
    1.  The app has a "Guides" section.
    2.  The "Guides" section displays a list of available pour-over guides (e.g., V60, Chemex).
    3.  Clicking on a guide opens a detailed, step-by-step tutorial with visual aids.
    4.  The content for at least two initial guides is created and available in the app.

---

#### Story 3.2: AI Brew Recommendation
*   **As a** logged-in user,
*   **I want** to receive a specific recommendation on how to improve my next brew,
*   **so that** I can learn how to adjust my technique to achieve my desired taste.
*   **Acceptance Criteria:**
    1.  After saving a new brew log, the user is presented with an option to "Get a recommendation for next time."
    2.  The user can specify their goal for the next brew (e.g., "more sweetness," "less bitterness").
    3.  The backend sends the last brew's parameters and the user's goal to an AI service.
    4.  The AI service returns a recommendation for a single variable change (e.g., "Grind 2 clicks finer").
    5.  The recommendation is displayed to the user with a brief explanation of why the change is being suggested.

---

#### Story 3.3: Start Brew from a Guide
*   **As a** logged-in user,
*   **I want** to start a new brew log directly from a brewing guide,
*   **so that** the brewing parameters from the guide are pre-filled in my log.
*   **Acceptance Criteria:**
    1.  Each brewing guide page has a "Start Brewing with this Guide" button.
    2.  Clicking this button takes the user to the "Log New Brew" page.
    3.  The brewing parameters on the page are pre-filled with the values from the guide.
    4.  The user can then adjust these parameters as they perform their brew.

## Checklist Results Report

### PM Checklist Results Report

**Executive Summary**
*   **Overall PRD Completeness:** 95%
*   **MVP Scope Appropriateness:** Just Right
*   **Readiness for Architecture Phase:** Ready
*   **Most Critical Gaps or Concerns:** None. The PRD is robust. Minor cross-functional requirements (like data retention policies) can be defined during the architecture and development phase.

**Category Analysis**
| Category                         | Status  | Critical Issues |
| -------------------------------- | :-----: | :-------------- |
| 1. Problem Definition & Context  |  PASS   | None            |
| 2. MVP Scope Definition          |  PASS   | None            |
| 3. User Experience Requirements  |  PASS   | None            |
| 4. Functional Requirements       |  PASS   | None            |
| 5. Non-Functional Requirements   |  PASS   | None            |
| 6. Epic & Story Structure        |  PASS   | None            |
| 7. Technical Guidance            |  PASS   | None            |
| 8. Cross-Functional Requirements | PARTIAL | None            |
| 9. Clarity & Communication       |  PASS   | None            |


**Recommendations**
My recommendation is to approve this PRD and proceed to the next phase of the project, which is to engage the Architect and the UX Expert.

**Final Decision: READY FOR ARCHITECT**

## Next Steps

### UX Expert Prompt
"Hi Sally, we have a completed Product Requirements Document (PRD) for a new coffee learning web app. We need your expertise to create a front-end specification based on the UI/UX goals outlined in the PRD. Please review the attached PRD and let's get started on the front-end spec. You can activate your persona by typing `*ux-expert` and use the `create-front-end-spec` command."

### Architect Prompt
"Hi Winston, we have a completed Product Requirements Document (PRD) for a new coffee learning web app. We need you to design the system architecture based on the requirements and technical assumptions in the PRD. Please review the attached PRD and let's begin creating the architecture document. You can activate your persona by typing `*architect` and use the `create-full-stack-architecture` command."
