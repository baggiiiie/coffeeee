# Epic 2: Coffee & Brew Logging

**Expanded Goal:** The goal of this epic is to deliver the core data-logging functionality of the application. Users will be able to create a beautiful, visual log of the coffees they have tried and meticulously record the parameters and tasting notes for each brew they make. This epic provides the foundational data that will be used by the AI recommendation engine in the next epic.

---

### Story 2.1: Create Coffee "Journey" Log
*   **As a** logged-in user,
*   **I want** to add a new coffee to my personal collection by uploading a photo of the bag and adding details,
*   **so that** I can keep a record of all the coffees I have tried.
*   **Acceptance Criteria:**
    1.  The authenticated dashboard has a button to "Add New Coffee."
    2.  The "Add New Coffee" page has fields for coffee name, roaster, origin, etc., and a file upload for the bag photo.
    3.  The backend has an endpoint to create a new coffee entry in the database, associated with the logged-in user.
    4.  (Stretch Goal) The backend sends the uploaded photo to an AI service to attempt to extract text and pre-fill the form fields.

---

### Story 2.2: View Coffee Gallery
*   **As a** logged-in user,
*   **I want** to see all the coffees I have logged in a visually appealing gallery,
*   **so that** I can easily browse my coffee history.
*   **Acceptance Criteria:**
    1.  The dashboard links to a "My Coffees" page.
    2.  The "My Coffees" page displays a grid of cards, each showing the photo and name of a logged coffee.
    3.  Clicking on a coffee card navigates the user to the detail page for that coffee.

---

### Story 2.3: Create Brew Log
*   **As a** logged-in user,
*   **I want** to start a new brew log for a specific coffee from my collection,
*   **so that** I can record the details of my brew.
*   **Acceptance Criteria:**
    1.  The Coffee Detail Page has a "Log New Brew" button.
    2.  The "Log New Brew" page has input fields for all the required brewing parameters (grind size, water temp, ratio, etc.).
    3.  The backend has an endpoint to create a new brew log entry, associated with the specific coffee.
    4.  Upon saving, the user is redirected back to the Coffee Detail Page.

---

### Story 2.4 (Revised): AI-Guided Tasting Experience
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

### Story 2.5: View Brew History
*   **As a** logged-in user,
*   **I want** to see a history of all the brews I have logged for a specific coffee,
*   **so that** I can track my progress and see how my brew variables have changed over time.
*   **Acceptance Criteria:**
    1.  The Coffee Detail Page displays a list of all brew logs associated with that coffee.
    2.  Each item in the list shows key information like the date and the main tasting notes.
    3.  The user can click on a brew log to see its full details.
