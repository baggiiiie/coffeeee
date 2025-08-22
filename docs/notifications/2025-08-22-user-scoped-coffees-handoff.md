# Handoff: User-Scoped Coffees (Add `user_id`, Remove `user_coffees`)

Audience: James (Dev), Winston (Architect)
Date: 2025-08-22
Owner: Bob (Scrum Master)

## Context
- Approved change: Coffees are owned by the creating user via `coffees.user_id`; the `user_coffees` table is removed.
- API keeps “find-or-create” per user; photos stored on `coffees.photo_path`.
- Proposal: docs/changes/2025-08-22-sprint-change-proposal-coffees-userid.md

## Actions — Dev (James)
- Implement Story 2.7: docs/stories/2.7.story.md
  - Edit `apps/backend/migrations/001_initial_schema.sql` to add `user_id` to `coffees` + indexes.
  - Remove `apps/backend/migrations/002_user_coffees.up.sql` and `.down.sql`.
  - Refactor `CreateForMe` in `apps/backend/internal/api/handlers/coffee.go` to per-user find-or-create; return only `coffee`.
  - Ensure no references to `user_coffees` remain.
- Align Photo Upload (Story 2.6 updated): docs/stories/2.6.story.md
  - Ensure upload returns updated coffee and persists path to `coffees.photo_path`.
- Tests
  - Add tests: idempotent create per user; distinct across users; owner-only photo update.

## Actions — Architect (Winston)
- Update database schema doc: docs/architecture/database-schema.md
  - Add `user_id` to `coffees`; add indexes list; update relationships to user-owned coffees.
  - Remove join-table references for coffees.
- PRD wording tweak: docs/prd/epic-2-coffee-brew-logging.md (Story 2.1 AC 3)
  - Clarify find-or-create owned by logged-in user; photo is on coffee record.

## Tracking
- Checklist tasks: docs/qa/follow-ups/2.7.follow-ups.yml
- Success criteria in proposal and Story 2.7.

Please acknowledge receipt and pick up the respective tasks.

