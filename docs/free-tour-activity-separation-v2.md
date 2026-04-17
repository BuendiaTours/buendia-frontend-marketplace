# Free Tour ↔ Activity Separation — Backend v2 (event-driven model)

> Context doc for frontend Claude. Describes the new model for creating / deleting Free Tours after the April 2026 refactor.

## TL;DR

The frontend no longer orchestrates two sequential calls to create a Free Tour. Instead:

1. The frontend creates a plain `Activity` with `kind: FREE_TOUR` in `DRAFT` status.
2. When the admin is ready to materialize the grouping, the frontend calls **`POST /activities/:id/promote-to-pending-group`** (dedicated business endpoint; do **not** send `status` in a generic `PATCH`).
3. The backend transitions the activity's status to `PENDING_GROUP` and, via an internal cross-context event handler, **automatically creates a `FreeTour`** with that activity as its main entry. Once the grouping is materialized, a second handler transitions the activity's status to `GROUPED` (the steady state).
4. The frontend discovers the new free-tour id by querying `GET /free-tours?entryActivityId=...` after a short delay for CQRS projection propagation.

Delete flow is now also event-driven: `DELETE /free-tours/:id` removes all entries (each emits an event that sends the activity back to `DRAFT`) and then deletes the free tour.

> **Do not PATCH `status`**: the generic `PATCH /activities/:id` endpoint does **not** expose `status`. Use the dedicated business endpoints (`publish`, `unpublish`, `promote-to-pending-group`) for lifecycle transitions.

---

## New statuses: `PENDING_GROUP` and `GROUPED`

Added to `ActivityStatus` enum (backend + frontend sync already applied):

```ts
export enum ActivityStatus {
	APPROVED,
	DELETED,
	DRAFT,
	GROUPED, // ← NEW — steady state: activity is linked to a FreeTour
	PENDING_GROUP, // ← NEW — transient: grouping is being materialized
	PENDING_REVIEW,
	PUBLISHED,
	REJECTED,
	UNPUBLISHED
}
```

### Semantics

- **`PENDING_GROUP`** is transient. Reachable via the promote endpoint for `kind: FREE_TOUR` activities currently in `DRAFT`; triggers the auto-creation of a FreeTour. The activity then transitions automatically (within milliseconds) to `GROUPED` via the `FreeTourEntryAddedEvent` handler.
- **`GROUPED`** is the steady state for a FREE_TOUR activity currently linked to a FreeTour. The frontend should rely on this status to know whether an activity already belongs to a grouping.
- Any promote call on a non-FREE_TOUR or non-DRAFT activity returns `400 ACTIVITY_NOT_PROMOTABLE`.
- If the FreeTour is later deleted (or the entry is removed), the activity automatically returns to `DRAFT` via the `FreeTourEntryRemovedEvent` handler. The admin can call promote again to create a fresh grouping.
- **Idempotent at infra level.** The auto-create handler in free-tour silently skips if a FreeTour already exists for the activity.

### Invariant (backend-enforced)

> Every `FREE_TOUR` activity in `GROUPED` status has **exactly one** `FreeTour` grouping. Activities in `PENDING_GROUP` are in the process of being grouped (transient). Activities in `DRAFT` legitimately have no grouping — that's the "editing in progress" state.

---

## Frontend flow: creating a Free Tour in the backoffice

### Old flow (deprecated, still works for now but retire ASAP)

```
POST /activities     { kind: FREE_TOUR, ...fields }
POST /free-tours/from-activity/:activityId   { id, entryId }
```

### New flow (recommended)

```ts
// 1. Create the activity in DRAFT status.
const activityId = crypto.randomUUID();
await ACTIVITY_REQUEST.create(fetch, {
	id: activityId,
	kind: ActivityKind.FREE_TOUR,
	title: '...',
	slug: '...',
	supplierId: '...',
	guideKind: '...',
	descriptionFull: '...'
	// ...other activity fields
});

// 2. Wait for CQRS projection (~500ms). Optionally poll GET /activities/:id.

// 3. Promote the activity to PENDING_GROUP via dedicated endpoint.
//    The backend auto-creates a FreeTour with this activity as its main entry.
await ACTIVITY_REQUEST.promoteToPendingGroup(fetch, activityId);

// 4. Wait again (~500ms) and find the newly-created free tour.
const { data } = await FREE_TOUR_REQUEST.findByCriteria(fetch, {
	entryActivityId: activityId
});
const freeTourId = data[0]?.id;

// 5. Redirect to the free-tour editor.
goto(`/backoffice/free-tours/${freeTourId}/edit`);
```

> **Prerequisite for step 4**: the backend criteria HTTP DTO must expose `entryActivityId`. If the request returns all free tours (filter ignored), ask backend to wire up the filter in `FreeTourCriteriaHttpDto` + query factory + mongoose criteria mapper. The domain-level filter on the aggregate side already exists.

### What gets copied from Activity → FreeTour on auto-create

When the auto-creation handler fires, the following activity fields are copied to the new FreeTour:

| Activity field                                         | FreeTour field                   | Notes                           |
| ------------------------------------------------------ | -------------------------------- | ------------------------------- |
| `title`, `slug`, `descriptionFull`, `descriptionShort` | same                             | Identical semantics             |
| `categoryIds` (M:N)                                    | `categoryIds`                    | Same set                        |
| `contentBlockIds` (with order)                         | `contentBlockIds`                | Order preserved by `position`   |
| `locations` where `role = DESTINATION`                 | `destinationIds`                 | Only DESTINATION role is copied |
| `mediaIds`                                             | `mediaIds` + resolved `images[]` | Images resolved cross-context   |
| `excluded[]`, `included[]`, `restrictions[]`           | same (enum values identical)     |                                 |
| `meetingPoint` (jsonb)                                 | same                             |                                 |
| `phoneContact`, `supplierTip`, `voucherInfo`           | same                             |                                 |
| `willDoing[]`                                          | same                             |                                 |

**Not copied**: `status` (FreeTour starts in `DRAFT`), `kind`, `difficulty`, `featuredScore`, `dateMode`, `guideKind`, `codeRef`, `infoImportant`, `itemsToBring`, `meals`, `notSuitableFor`, `petsAllowed`, `stages`, `transportKind`, `transportLocation`, `supplierId`.

The activity's own record is untouched — it keeps all its fields and can continue to be edited independently from the grouping.

---

## Delete flow

### Request

```ts
await FREE_TOUR_REQUEST.delete(fetch, freeTourId);
```

### Backend behavior

1. For each `Entry` in the free tour, the backend emits `FreeTourEntryRemovedEvent(activityId, entryId)`.
2. The activity context listens to that event and transitions the referenced activity's status → `DRAFT`.
3. The `FreeTour` aggregate is deleted. Its projection is also deleted.

**Result**: the free tour disappears, and each formerly-linked activity is back in `DRAFT`. The activities are **not deleted**; they stay in the catalog for future editing.

**UX implication**: after deletion, if the admin navigates to `/backoffice/activities/:id/edit` they'll see the activity in DRAFT status. Calling promote again creates a brand-new FreeTour (with default editorial fields re-copied from the current activity data).

---

## Endpoints still available (but secondary)

These remain supported for legacy / migration / special flows — don't remove them from the client lib:

| Endpoint                                     | Purpose                                                                                                                                                                                         |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /free-tours/from-activity/:activityId` | Manually create a FreeTour from an existing activity. Same validations as the event-driven flow (activity must be FREE_TOUR, not already grouped). Useful for data migration / backfill.        |
| `POST /free-tours/:id/entries`               | Add additional entries to a FreeTour. Today the 1↔1 invariant blocks it in practice (activity already grouped → service throws); endpoint is kept for a future "multi-entry per group" feature. |
| `DELETE /free-tours/:id/entries/:entryId`    | Remove a single entry. Triggers the same activity → DRAFT side effect as the full delete.                                                                                                       |

---

## Error codes to handle

| HTTP  | Backend exception code             | Scenario                                                                                                                                   | Suggested UX                                                      |
| ----- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `400` | `ACTIVITY_NOT_PROMOTABLE`          | `promoteToPendingGroup` called on a non-FREE_TOUR activity or one that isn't in DRAFT. Payload includes `currentStatus` and `currentKind`. | Toast: "La actividad no puede promocionarse en su estado actual." |
| `400` | `ACTIVITY_NOT_FOUND`               | Activity id doesn't exist                                                                                                                  | Toast + redirect to list                                          |
| `400` | `FREE_TOUR_ACTIVITY_NOT_FREE_TOUR` | Manual `from-activity` on a non-FREE_TOUR activity                                                                                         | Toast: "La actividad seleccionada no es un Free Tour."            |
| `400` | `FREE_TOUR_ENTRY_ALREADY_EXISTS`   | Activity already assigned to another grouping (manual endpoints only; promote flow is blocked earlier by the DRAFT precondition)           | Toast: "Esta actividad ya forma parte de otro Free Tour."         |
| `400` | `FREE_TOUR_ALREADY_EXISTS`         | UUID collision (very rare; regenerate id)                                                                                                  | Retry with fresh UUID                                             |
| `400` | `FREE_TOUR_NOT_FOUND`              | FreeTour id not found on update/delete                                                                                                     | Toast + redirect to list                                          |

> Backend maps application exceptions to HTTP `400` by default. If you need `409` specifically for UX reasons, ask backend to add HTTP status metadata to the exceptions.

---

## What does NOT need to change in the frontend client code

- `FREE_TOUR_REQUEST.create` (the empty-group create) still works and retains its current signature. It's kept because we may want it for admin tooling, but it's **not** the recommended path for backoffice users creating a product.
- `FREE_TOUR_REQUEST.createFromActivity(activityId, { id, entryId })` still works — handy as a manual fallback when the event-driven flow is insufficient.
- DTOs and projection types in `src/core/free-tours/types.ts` are unchanged.

---

## Migration / cleanup suggestions

- **Retire the temporary frontend orchestration**: the two-step flow in `/backoffice/free-tours/create/+page.server.ts` can be replaced by the promote-endpoint approach described above.
- **Remove the `withoutFreeTour` filter** from `ActivityCriteria` — with the new model, a FREE_TOUR activity in `DRAFT` may legitimately have no grouping (it's a valid state, not an orphan), so the filter doesn't express anything useful.
- **Verify `kind` filter on `/activities` listings**: no FREE_TOUR activity should leak into a PAID_TOUR listing. This is a backend concern but worth spot-checking.
- **Backoffice UI**: expose `PENDING_GROUP` as a button action ("Crear agrupación Free Tour") rather than a status dropdown option — the only way to reach that status is via the dedicated endpoint.

---

## Cheat sheet: status state machine for FREE_TOUR activities

```
           (create activity)
                  ↓
              [DRAFT] ←─────────────┐
                  │                 │
  POST /activities/:id/             │ (FreeTour deleted →
    promote-to-pending-group        │  activity auto-reverts via
                  │                 │  FreeTourEntryRemovedEvent handler)
                  ↓                 │
          [PENDING_GROUP]           │
                  │                 │
    (auto-transition via            │
     FreeTourEntryAddedEvent        │
     once grouping is               │
     materialized; ~ms)             │
                  │                 │
                  ↓                 │
            [GROUPED] ──────────────┘
                  │
      (admin edits grouping editorial content in backoffice)
                  │
                  ↓
    FreeTour [PUBLISHED] via its own endpoint
```

For non-FREE_TOUR activities, `PENDING_GROUP` and `GROUPED` are unreachable — the promote endpoint rejects with `ACTIVITY_NOT_PROMOTABLE`.
