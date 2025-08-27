# Story 2.5: View Brew History
*   **As a** logged-in user,
*   **I want** to see a history of all the brews I have logged for a specific coffee,
*   **so that** I can track my progress and see how my brew variables have changed over time.
*   **Acceptance Criteria:**
    1.  The Coffee Detail Page shows a primary "Log New Brew" button at the top of the content area.
    2.  Directly below the "Log New Brew" button, the page displays both:
        - A Coffee Info section (e.g., name, roaster, origin, process, roast date if known, tasting notes preview, bag photo if available).
        - A Brew Logs section listing all brew logs associated with that coffee.
    3.  Brew Logs are shown in reverse chronological order (most recent first).
    4.  Each brew log item shows key information: brew date/time, method, core parameters (e.g., dose → yield or ratio), optional rating, and a short tasting-notes excerpt.
    5.  Clicking a brew log navigates to its full details view.
    6.  Empty state: If there are no brew logs, show a friendly message (e.g., "No brews yet") and a CTA under the button to start the first brew (same action as "Log New Brew").
    7.  Layout is responsive: on mobile, sections stack vertically under the button; on larger screens, spacing and typography remain readable and consistent.
