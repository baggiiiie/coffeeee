# Story 2.1: Create Coffee "Journey" Log
*   **As a** logged-in user,
*   **I want** to add a new coffee to my personal collection by uploading a photo of the bag and adding details,
*   **so that** I can keep a record of all the coffees I have tried.
*   **Acceptance Criteria:**
    1.  The authenticated dashboard has a button to "Add New Coffee."
    2.  The "Add New Coffee" page has fields for coffee name, roaster, origin, etc., and a file upload for the bag photo.
    3.  The backend endpoint finds-or-creates a coffee owned by the logged-in user, and stores the uploaded photo path on the coffee record.
    4.  (Stretch Goal) The backend sends the uploaded photo to an AI service to attempt to extract text and pre-fill the form fields.

---
