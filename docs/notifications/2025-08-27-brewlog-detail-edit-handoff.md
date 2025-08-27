# Handoff: Brew Log Detail Navigation + Edit

Audience: James (Dev), Quinn (QA)
Date: 2025-08-27
Owner: Bob (Scrum Master)

## Context
- Problem: Coffee Detail brew history item click opens the new-log flow instead of the brew log detail.
- Impact: Violates Story 2.5 AC5; users cannot view a single log from history.
- Proposal: docs/changes/2025-08-27-sprint-change-proposal-brewlog-detail-edit.md
- New Story: docs/stories/2.6.story.md (Edit Brew Log) — Approved

## Actions — Dev (James)
- Story 2.5 bug fix (routing):
  - Wire brew history list item click to `/brew-logs/:id` using the brew log id.
  - Update tests to assert navigation to detail (not new-log) on click.
- Story 2.6 implementation (Edit Brew Log):
  - Add `BrewLogDetailPage` at `/brew-logs/:id` to display full log.
  - Provide Edit action (inline or modal) using `PUT /api/v1/brewlogs/{id}`; refresh on success.
  - Handle 401/403/404 with friendly UI and test IDs.
  - Add FE/BE tests for view/edit, validation, and errors.

## Actions — QA (Quinn)
- Verify Story 2.5 AC5: clicking a brew history item opens the detail view, not new-log.
- For Story 2.6: validate detail view rendering, edit flow (validation, success, errors), and ownership constraints.

## Tracking
- Change Proposal: docs/changes/2025-08-27-sprint-change-proposal-brewlog-detail-edit.md
- Stories: docs/stories/2.5.story.md, docs/stories/2.6.story.md

Please acknowledge receipt and begin work per priority.

