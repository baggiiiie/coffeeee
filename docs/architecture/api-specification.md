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

### User Coffee Endpoints
Coffees are owned by the creating user (`coffees.user_id`). Creation is per-user find-or-create; listing is scoped to the authenticated user. Photos are stored on `coffees.photo_path`.

| Endpoint | Description | Request Body | Response Body | Auth Required |
|---|---|---|---|---|
| `POST /coffees` | Find-or-create a coffee owned by the authenticated user. | `{ "name" (req), "origin"?, "roaster"?, "description"?, "photoPath"? }` | Full `Coffee` object (including `userId`, `photoPath`) | Yes |
| `GET /coffees` | List coffees owned by the authenticated user. | | `[ Coffee ]` | Yes |
| `GET /coffees/{id}` | Get a coffee by ID (owner-only). | | Full `Coffee` object | Yes (Owner only) |

Notes:
- The server enforces ownership: `GET /coffees/{id}` returns 403 if the coffee is not owned by the caller.
- Per-user find-or-create typically matches on `name` plus optional `origin`/`roaster`; exact matching logic is implementation-defined and may evolve.

### BrewLog Endpoints
These endpoints manage the logs created by users.

| Endpoint | Description | Request Body | Response Body | Auth Required |
|---|---|---|---|---|
| `POST /brewlogs` | Create a new brew log for the authenticated user (coffee must be owned by user). | `{ "coffeeId", "brewMethod", "coffeeWeight", ... }` | Full `BrewLog` object | Yes |
| `GET /brewlogs` | Get all brew logs for the authenticated user. | | `[ { "id", "coffeeId", ... } ]` | Yes |
| `GET /brewlogs/{id}` | Get a single brew log by its ID. | | Full `BrewLog` object | Yes (Owner only) |
| `PUT /brewlogs/{id}` | Update a brew log. | `{ "brewMethod", "coffeeWeight", ... }` | Full `BrewLog` object | Yes (Owner only) |
| `DELETE /brewlogs/{id}` | Delete a brew log. | | `204 No Content` | Yes (Owner only) |
| `GET /users/{userId}/brewlogs` | Get all brew logs for a specific user. | | `[ { "id", "coffeeId", ... } ]` | No |

---
