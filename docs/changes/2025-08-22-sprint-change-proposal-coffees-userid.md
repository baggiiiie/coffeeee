# Sprint Change Proposal: User-Scoped Coffees (Add `user_id`, Remove `user_coffees`)

- Date: 2025-08-22
- Trigger: Request to add `user_id` to `coffees` to indicate which user added the coffee and remove the `user_coffees` join table. Update all related files.
- Mode: Incremental analysis, then consolidated proposal

## 1) Identified Issue Summary

- Current model stores coffees globally and associates users to coffees via `user_coffees` (many-to-many). Business decision: Coffees are added by a user and should be owned by that user; no need for `user_coffees`.
- Required change: Make coffees user-scoped by adding `user_id` to `coffees`; remove `user_coffees`. Keep “find-or-create” semantics per user. Store photo only on `coffees`.

## 2) Epic Impact Summary

- Epic 2 goals remain intact. Stories and user flows stay the same conceptually.
- Minor clarifications only: Stories reference that a coffee belongs to the logged-in user; remove any implication of cross-user sharing via links.

## 3) Artifact Adjustment Needs

- PRD (docs/prd/epic-2-coffee-brew-logging.md)
  - Clarify Story 2.1 acceptance: coffee is created and owned by the logged-in user; idempotent “find-or-create” per user by `(user_id, name, origin, roaster)` semantics.
  - Remove any implication of linking via a join table.
- Backend Migrations (apps/backend/migrations)
  - Modify `001_initial_schema.sql` to include `user_id` on `coffees`, relevant indexes, and omit `user_coffees` entirely.
  - Remove `002_user_coffees.up.sql` and `002_user_coffees.down.sql` from the repo.
- Backend API (apps/backend/internal/api/handlers/coffee.go)
  - Update `CreateForMe` to find-or-create per user using `coffees` with `user_id`.
  - Remove `user_coffees` insert/query logic and associated response `link` object.
  - Ensure response returns the coffee (with its metadata including `photo_path` if saved).
  - Adjust any List/Get handlers to filter coffees by `user_id` and remove reliance on join table.
- Tests
  - Update or add tests reflecting user-scoped coffees and removal of `user_coffees`.
- Documentation
  - README unaffected functionally; optionally document the new ownership model.

## 4) Recommended Path Forward

- Direct Adjustment / Integration: Implement a new migration and refactor the coffee handler(s) accordingly. This reduces complexity (one fewer table) and aligns with the product decision. Minimal risk since no legacy `user_coffees` data needs preservation.

## 5) Proposed Specific Edits

### 5.1 Database Schema (Modify 001, remove 002)

- Update `apps/backend/migrations/001_initial_schema.sql`:
  - Add `user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE` to `coffees`.
  - Keep existing fields; keep `photo_path` on `coffees`.
  - Add indexes: `idx_coffees_user_id (user_id)` and optional `idx_coffees_user_name (user_id, name)`.
  - Do NOT create any `user_coffees` table.
- Remove `apps/backend/migrations/002_user_coffees.up.sql` and `.down.sql` from the repository.

Note: Setup already runs 001 directly; updating 001 keeps fresh environments aligned. No data migration is required per our decision.

### 5.2 Handler Changes (apps/backend/internal/api/handlers/coffee.go)

- Update CreateForMe to:
  - Find coffee by `user_id`, `name`, optional `origin`, optional `roaster`.
  - If not found, insert into `coffees` with `user_id` and optional `photo_path`.
  - Remove all `user_coffees` writes and queries; delete unique-constraint handling specific to that table.
  - Response no longer includes `link`; return the created/found coffee with timestamps and optional `photoPath`.

- Adjust List/Get to use `WHERE user_id = ?` and remove any joins to `user_coffees`.

Pseudo-diff for CreateForMe (illustrative):

```diff
- // Find existing coffee by name+origin+roaster
- err = tx.QueryRow(`SELECT id FROM coffees WHERE name = ? AND IFNULL(origin,'') = ? AND IFNULL(roaster,'') = ?`, name, origin, roaster).Scan(&coffeeID)
+ // Find by user + properties (idempotent per user)
+ err = tx.QueryRow(`SELECT id FROM coffees WHERE user_id = ? AND name = ? AND IFNULL(origin,'') = ? AND IFNULL(roaster,'') = ?`, userID, name, origin, roaster).Scan(&coffeeID)

-        res, err := tx.Exec(`INSERT INTO coffees (name, origin, roaster, description) VALUES (?, ?, ?, ?)`, name, nullIfEmpty(origin), nullIfEmpty(roaster), nullIfEmpty(description))
+        res, err := tx.Exec(`INSERT INTO coffees (user_id, name, origin, roaster, description, photo_path) VALUES (?, ?, ?, ?, ?, ?)`, userID, name, nullIfEmpty(origin), nullIfEmpty(roaster), nullIfEmpty(description), nullIfEmpty(photoPath))

-    // Link user to coffee (idempotent)
-    if photoPath != "" { /* insert into user_coffees ... */ }
-    ... unique constraint handling on user_coffees ...
+    // No join table; ownership is on coffees. Nothing to link.

-    // Populate response including link metadata
+    // Populate response with coffee metadata only
```

### 5.3 Response Shape

Request (unchanged):

```json
{ "name": "...", "origin": "...", "roaster": "...", "description": "...", "photoPath": "..." }
```

Response (updated; no `link`):

```json
{
  "coffee": {
    "id": 123,
    "name": "...",
    "origin": "...",
    "roaster": "...",
    "description": "...",
    "photoPath": "...",
    "createdAt": "2025-08-22T10:00:00Z",
    "updatedAt": "2025-08-22T10:00:00Z"
  }
}
```

### 5.4 PRD Updates (docs/prd/epic-2-coffee-brew-logging.md)

- Story 2.1 Acceptance Criterion 3: clarify as “The backend has an endpoint to find-or-create a new coffee entry owned by the logged-in user and store the optional photo on the coffee record.”
- No other content changes required.

### 5.5 Tests

- Update handler tests to reflect:
  - No `user_coffees` queries or unique-violation handling.
  - Find-or-create per user semantics.
  - Listing/filtering by `user_id`.

## 6) High-Level Action Plan

1) Add migration `003_user_scoped_coffees.sql` and run it locally.
2) Refactor `CreateForMe`, `List`, `Get` in `coffee.go` to use `coffees.user_id` and remove `user_coffees` usage.
3) Update response model to exclude `link`; include `photoPath` on coffee.
4) Adjust PRD acceptance text; add a brief note in README if desired.
5) Update or add tests covering create, idempotency, and list-by-user.

## 7) Success Criteria

- Database contains coffees with non-null `user_id`; `user_coffees` table removed.
- POST `/api/v1/coffees` is idempotent per user and returns coffee only.
- Listing and access control respect `user_id` on coffees.
- All tests pass; no references to `user_coffees` remain.

## 8) Handoff Plan

- Dev: Implement migration and handler refactor per above.
- QA: Verify endpoints and data model changes, including idempotency and access control.
- SM/PO: Update PRD acceptance line and review.

---

Approval: Please confirm to proceed with these edits.
