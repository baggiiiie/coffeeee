# Technical Assumptions

## Repository Structure: Monorepo
*   **Recommendation:** We will use a **Monorepo**, which means a single repository will contain the code for both the frontend (React) and the backend (Go).
*   **Rationale:** For a solo developer, this is often much simpler to set up and manage than juggling multiple repositories.

## Service Architecture: Monolith
*   **Recommendation:** We will use a **Monolithic** architecture for the backend. This means all the backend logic will be in a single, unified application.
*   **Rationale:** This is the simplest and fastest approach for an MVP. It avoids the operational complexity of microservices, which is unnecessary at this stage.

## Testing Requirements: Unit + Integration
*   **Recommendation:** We will aim for a combination of **Unit Tests** (testing small, individual pieces of code) and **Integration Tests** (testing how different parts of the app work together).
*   **Rationale:** This provides a good balance of confidence and effort for an MVP. A full end-to-end (E2E) testing suite can be added later if needed.

## Additional Technical Assumptions
*   The application will be built using **React, Go, and SQLite**, as we decided earlier.
*   A third-party AI API will be required for the smart features. The specific choice of API will be determined during development.
