# API Specification

All endpoints will be prefixed with `/api/v1`.

### User & Authentication Endpoints
| Endpoint | Description | Request Body | Response Body | Auth Required |
|---|---|---|---|---|
| `POST /users` | Create a new user (Sign up). | `{ "username", "email", "password" }` | `{ "id", "username", "email", "createdAt" }` | No |
| `POST /auth/login` | Authenticate a user and receive a token. | `{ "email", "password" }` | `{ "token" }` | No |
| `GET /users/me` | Get the profile of the currently authenticated user. | | `{ "id", "username", "email" }` | Yes |
| `PUT /users/me` | Update the authenticated user's profile. | `{ "username", "email" }` | `{ "id", "username", "email" }` | Yes |
| `DELETE /users/me` | Delete the authenticated user's account. | | `204 No Content` | Yes |

### Coffee Endpoints
These endpoints manage the canonical list of coffees.

| Endpoint | Description | Request Body | Response Body | Auth Required |
|---|---|---|---|---|
| `POST /coffees` | Add a new coffee to the system. | `{ "name", "origin", "roaster", "description" }` | Full `Coffee` object | Yes |
| `GET /coffees` | Get a paginated list of all coffees. | | `[ { "id", "name", ... } ]` | No |
| `GET /coffees/{id}` | Get a single coffee by its ID. | | Full `Coffee` object | No |
| `PUT /coffees/{id}` | Update a coffee's details. | `{ "name", "origin", ... }` | Full `Coffee` object | Yes (Admin?) |
| `DELETE /coffees/{id}` | Delete a coffee from the system. | | `204 No Content` | Yes (Admin?) |

*Note: For the MVP, any authenticated user can add a coffee. We may want to restrict PUT/DELETE to admins in the future.*

### BrewLog Endpoints
These endpoints manage the logs created by users.

| Endpoint | Description | Request Body | Response Body | Auth Required |
|---|---|---|---|---|
| `POST /brewlogs` | Create a new brew log for the authenticated user. | `{ "coffeeId", "brewMethod", "coffeeWeight", ... }` | Full `BrewLog` object | Yes |
| `GET /brewlogs` | Get all brew logs for the authenticated user. | | `[ { "id", "coffeeId", ... } ]` | Yes |
| `GET /brewlogs/{id}` | Get a single brew log by its ID. | | Full `BrewLog` object | Yes (Owner only) |
| `PUT /brewlogs/{id}` | Update a brew log. | `{ "brewMethod", "coffeeWeight", ... }` | Full `BrewLog` object | Yes (Owner only) |
| `DELETE /brewlogs/{id}` | Delete a brew log. | | `204 No Content` | Yes (Owner only) |
| `GET /users/{userId}/brewlogs` | Get all brew logs for a specific user. | | `[ { "id", "coffeeId", ... } ]` | No |

---