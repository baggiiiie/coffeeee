# Sprint Change Proposal — Brew Log Detail & Edit

## Summary
- Trigger: Story 2.5 (View Brew History) shows brew history on Coffee Detail, but clicking an item opens the new-log flow instead of the brew log detail.
- Impact: Violates AC5 of Story 2.5 (click should navigate to full details view); users cannot view a single brew log or update it.
- Recommendation: 
  - A) Fix navigation wiring under Story 2.5 to route to `/brew-logs/:id` (no PRD change needed; aligns with AC5 and architecture).
  - B) Add a new story (2.6 Edit Brew Log) to provide an Edit option on the brew log detail page using `PUT /api/v1/brewlogs/{id}`.

## Context & Evidence
- User observed: Clicking a brew history item currently triggers the Add New Brew flow.
- Architecture references `/brew-logs/:id` as View/Edit route (docs/architecture.md and docs/architecture/frontend-architecture.md).
- API supports single fetch and update: `GET /brewlogs/{id}`, `PUT /brewlogs/{id}` (docs/architecture/api-specification.md).

## Epic Impact
- Current epic remains viable; only a minor wiring fix is needed for Story 2.5.
- Introduce a separate story to scope editing functionality cleanly within Epic 2.

## Artifact Adjustments
- PRD: No change to Story 2.5 text (AC5 already mandates navigating to details). Add a new PRD-aligned story for editing (Story 2.6) with clear ACs.
- Architecture (frontend): Ensure route and page exist for `/brew-logs/:id` (BrewLogDetailPage) with an Edit action.
- API: No change; use existing `GET/PUT /brewlogs/{id}`.

## Proposed Edits
1) Story 2.5 (docs/stories/2.5.story.md)
   - Record a bug/defect task: “Brew history item click navigates to new-log instead of detail; update click handler to route to `/brew-logs/:id`.”
   - Developer note: Ensure Coffee Detail’s `BrewLogList` item uses the brew log’s `id` and navigates to `/brew-logs/:id`.

2) New Story 2.6 — Edit Brew Log (created separately in docs/stories/2.6.story.md)
   - Detail page at `/brew-logs/:id` shows full BrewLog information.
   - Edit button toggles inline edit or opens an edit form; on save, `PUT /api/v1/brewlogs/{id}`, then show updated details and toast.
   - Authorization: Only owner can view/edit; handle 401/403 with structured errors.

## Recommended Path Forward
- Select Recommended Path: Fix 2.5 navigation + add Story 2.6 for editing (separate scope). Rationale: Restores conformance to 2.5 quickly and provides a clean, testable implementation path for edit without bloating 2.5.

## High-Level Action Plan
- SM/PO: Prioritize bug fix under Story 2.5 and queue Story 2.6.
- Dev: 
  - 2.5 fix: Wire click to `/brew-logs/:id`; verify navigation tests.
  - 2.6: Implement BrewLogDetailPage and edit flow; add tests for view/edit, success/error paths.
- QA: Validate AC5 for 2.5; validate full ACs for 2.6.

## Approval
- Please review and approve. On approval, proceed with 2.5 bug fix and then implement Story 2.6.

