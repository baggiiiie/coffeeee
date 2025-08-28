# Epic 3: Learning & Guidance

**Expanded Goal:** The goal of this epic is to build the core educational and "smart" features of the application. By the end of this epic, users will not only be able to log their data but will also receive guidance on how to brew better coffee and learn from structured content, fulfilling our promise of being a true Coffeeee.

---

### Story 3.1: View Brewing Guides
*   **As a** logged-in user,
*   **I want** to browse and view a library of pour-over brewing guides,
*   **so that** I can learn the correct techniques for different brewers.
*   **Acceptance Criteria:**
    1.  The app has a "Guides" section.
    2.  The "Guides" section displays a list of available pour-over guides (e.g., V60, Chemex).
    3.  Clicking on a guide opens a detailed, step-by-step tutorial with visual aids.
    4.  The content for at least two initial guides is created and available in the app.

---

### Story 3.2: AI Brew Recommendation
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

### Story 3.3: Start Brew from a Guide
*   **As a** logged-in user,
*   **I want** to start a new brew log directly from a brewing guide,
*   **so that** the brewing parameters from the guide are pre-filled in my log.
*   **Acceptance Criteria:**
    1.  Each brewing guide page has a "Start Brewing with this Guide" button.
    2.  Clicking this button takes the user to the "Log New Brew" page.
    3.  The brewing parameters on the page are pre-filled with the values from the guide.
    4.  The user can then adjust these parameters as they perform their brew.
