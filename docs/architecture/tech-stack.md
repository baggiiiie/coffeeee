# Tech Stack

## Technology Stack Table
| Category | Technology | Version | Purpose | Rationale |
|---|---|---|---|---|
| Frontend Language | TypeScript | latest | Type safety for the frontend application. | Catches errors early, improves code quality and maintainability. |
| Frontend Framework | React | 18.x | Building the user interface with components. | Modern, popular, and suitable for component-based UI with hydration. |
| UI Component Library | Material-UI (MUI) | latest | Pre-built UI components for faster development. | Provides a wide range of high-quality components that follow Material Design principles. |
| State Management | React Context | 18.x | Managing simple global state. | Built-in to React, sufficient for the MVP's needs without adding external dependencies. |
| Backend Language | Go | 1.22.x | The core backend language. | As specified in the high-level architecture, it's a performant language suitable for building a robust backend. |
| Backend Framework | Standard Library (`net/http`) | 1.22.x | Building the web server and REST API. | The standard library is powerful enough for our needs and avoids external dependencies for the core server. We can add specific libraries like `gorilla/mux` if needed for more complex routing. |
| API Style | REST | | Communication between frontend and backend. | A standard and well-understood API style. |
| Database | SQLite | 3.x | The application database. | Simple, file-based, and sufficient for the MVP. Easy to set up and manage. |
| Cache | N/A | | Not needed for MVP. | |
| File Storage | N/A | | Not needed for MVP. | |
| Authentication | N/A | | Not needed for MVP. | |
| Frontend Testing | Jest & React Testing Library | latest | Unit and component testing for the frontend. | Industry standard for testing React applications. |
| Backend Testing | Go standard library (`testing`) | 1.22.x | Unit and integration testing for the backend. | Built-in testing capabilities are sufficient for our needs. |
| E2E Testing | Playwright | latest | End-to-end testing for the entire application. | A modern and powerful E2E testing framework that supports multiple browsers. |
| Build Tool | `go build` | 1.22.x | Building the Go backend. | Standard Go build tool. |
| Bundler | Vite | latest | Bundling the frontend assets. | Fast, modern, and provides a great developer experience. |
| IaC Tool | N/A | | Not needed for MVP. | |
| CI/CD | GitHub Actions | | Continuous integration and deployment. | Integrated with our source control and easy to set up. |
| Monitoring | N/A | | Not needed for MVP. | |
| Logging | Go standard library (`log`) | 1.22.x | Logging for the backend. | Sufficient for our MVP needs. |
| CSS Framework | Emotion | latest | CSS-in-JS styling for React components. | Co-locates styles with components, making them more maintainable and reusable. Works well with Material-UI. |

---