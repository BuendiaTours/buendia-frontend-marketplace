# Distributives — Context for Backoffice Implementation

## What is a Distributive

A distributive is a **curated landing page** that combines search filters — categories, attractions, locations, and tags — into a navigable entity with its own URL, image gallery, FAQs, and SEO content. Examples: "Tours en Madrid", "Gastronomia en Barcelona", "Museos y monumentos en Sevilla".

Unlike a simple filtered search, each distributive has a custom name, slug, featured score, images, breadcrumbs, and related content. The system automatically counts how many published activities match the distributive's filters (`totalActivities`).

---

## Domain Model

### Aggregate: Distributive

| Field             | Type                   | Mutable | Notes                                  |
| ----------------- | ---------------------- | ------- | -------------------------------------- |
| `id`              | UUID                   | No      |                                        |
| `attractionIds`   | UUID[]                 | Yes     | Managed via add/remove endpoints       |
| `categoryIds`     | UUID[]                 | Yes     | Managed via add/remove endpoints       |
| `featuredScore`   | number (positive)      | Yes     | Ranking in featured listings           |
| `locations`       | DistributiveLocation[] | Yes     | Entity collection with roles           |
| `mediaIds`        | UUID[]                 | Yes     | Ordered media references               |
| `minPrice`        | number (integer)       | Yes     | Auto-calculated (cents)                |
| `name`            | string                 | Yes     | Display name                           |
| `slug`            | string (unique)        | Yes     | URL-friendly identifier                |
| `status`          | `DRAFT` \| `PUBLISHED` | Yes     | Controls visibility                    |
| `totalActivities` | number                 | Auto    | Count of matching published activities |

### Child Entity: DistributiveLocation

Each location in a distributive has a role:

| Field        | Type                                    |
| ------------ | --------------------------------------- |
| `id`         | UUID (entity ID)                        |
| `locationId` | UUID (reference to Location aggregate)  |
| `role`       | `DESTINATION` \| `ORIGIN` \| `WAYPOINT` |

### Status Lifecycle

```
DRAFT → PUBLISHED → DRAFT (toggle)
```

Created as DRAFT. Published to make visible. Can be unpublished back to DRAFT.

---

## API Contract

Base path: `/distributives`

### CRUD

| Method   | Path                 | Description                                                              |
| -------- | -------------------- | ------------------------------------------------------------------------ |
| `POST`   | `/distributives`     | Create (id, name, slug, featuredScore?, mediaIds?)                       |
| `PATCH`  | `/distributives/:id` | Update (name?, slug?, status?, featuredScore?, mediaIds?, attractionId?) |
| `DELETE` | `/distributives/:id` | Delete                                                                   |

### Queries

| Method | Path                                                | Returns                                                      |
| ------ | --------------------------------------------------- | ------------------------------------------------------------ |
| `GET`  | `/distributives`                                    | `CriteriaResult<Distributive>` — paginated list with filters |
| `GET`  | `/distributives/:id`                                | `Distributive` — full projection                             |
| `GET`  | `/distributives/slug/:slug`                         | `Distributive` — by URL slug                                 |
| `GET`  | `/distributives/:id/related-by-category`            | `DistributiveGroupedByCategory[]`                            |
| `GET`  | `/distributives/:id/related-by-attraction-location` | `DistributiveRelatedAttraction[]`                            |

### Sub-Resources (add/remove)

These are client-side operations — no redirect needed, update local state optimistically.

| Method   | Path                                           | Body                       |
| -------- | ---------------------------------------------- | -------------------------- |
| `POST`   | `/distributives/:id/categories`                | `{ categoryId }`           |
| `DELETE` | `/distributives/:id/categories/:categoryId`    | —                          |
| `POST`   | `/distributives/:id/attractions`               | `{ attractionId }`         |
| `DELETE` | `/distributives/:id/attractions/:attractionId` | —                          |
| `POST`   | `/distributives/:id/locations`                 | `{ id, locationId, role }` |
| `DELETE` | `/distributives/:id/locations/:locationId`     | —                          |

**Important**: The `POST locations` body requires generating a UUID for `id` (the entity ID), plus the `locationId` (reference to the Location aggregate) and the `role`.

### Criteria Filters

The GET `/distributives` endpoint accepts these query params:

| Param           | Type            | Description                    |
| --------------- | --------------- | ------------------------------ |
| `attractionId`  | string          | Filter by single attraction    |
| `attractionIds` | string[]        | Filter by multiple attractions |
| `categoryId`    | string          | Filter by single category      |
| `categoryIds`   | string[]        | Filter by multiple categories  |
| `locationId`    | string          | Filter by single location      |
| `locationIds`   | string[]        | Filter by multiple locations   |
| `locations`     | JSON array      | Filter by location+role pairs  |
| `tagId`         | string          | Filter by single tag           |
| `tagIds`        | string[]        | Filter by multiple tags        |
| `name`          | string          | Filter by name (partial match) |
| `searchText`    | string          | Free-text search               |
| `slug`          | string          | Filter by exact slug           |
| `skip`          | number          | Pagination offset              |
| `limit`         | number          | Page size                      |
| `sort`          | `NAME`          | Sort field                     |
| `operator`      | `AND` \| `OR`   | Combine filters                |
| `order`         | `ASC` \| `DESC` | Sort direction                 |

---

## Frontend Core Layer (already implemented)

The `src/core/distributives/` layer is already synced with the backend:

### `enums.ts`

```typescript
enum DistributiveLocationRole {
	DESTINATION,
	ORIGIN,
	WAYPOINT
}
enum DistributiveSortAttribute {
	NAME
}
enum DistributiveStatus {
	DRAFT,
	PUBLISHED
}
```

### `types.ts`

**Projection** (`Distributive`): 15 fields including nested arrays for attractions, breadcrumbs, categories, faqs, images, locations, tags, relatedDistributivesByAttractionLocation, relatedDistributivesByCategory.

**Sub-projections**: `DistributiveAttraction`, `DistributiveBreadcrumb`, `DistributiveCategory`, `DistributiveByCategoryLocation`, `DistributiveByCategoryEntry`, `DistributiveFaq`, `DistributiveGroupedByCategory`, `DistributiveImage`, `DistributiveLocation`, `DistributiveRelatedAttraction`, `DistributiveTag`.

**DTOs**: `DistributiveCreateDto`, `DistributiveUpdateDto`, `DistributiveAttractionAddDto`, `DistributiveCategoryAddDto`, `DistributiveLocationAddDto`.

**Criteria**: `DistributiveCriteria` with 17 filter fields + `DistributiveLocationFilter` for location+role pairs.

### `requests.ts`

`DISTRIBUTIVE_REQUEST` namespace with:

- CRUD: `create`, `update`, `delete`
- Queries: `findById`, `findBySlug`, `findByCriteria`, `findGroupedByCategory`, `findRelatedByAttractionLocation`
- Sub-resources: `addAttraction`, `removeAttraction`, `addCategory`, `removeCategory`, `addLocation`, `removeLocation`

---

## Backoffice Implementation Notes

### List Page (`/backoffice/distributives`)

Suggested filters:

- **Text search**: `name` or `searchText`
- **Status**: Dropdown with DRAFT/PUBLISHED
- **Category**: Async search (use category request from `$core/categories/requests`)
- **Location**: Async search
- **Sort**: NAME (ASC/DESC)

Table columns: name, status (badge), categories (count or first), locations (count or first), totalActivities, slug.

### Create Page (`/backoffice/distributives/create`)

Simple form — only 3 required fields:

- `name` (text)
- `slug` (text, auto-generated from name)
- Optional: `featuredScore` (number)

Categories, attractions, locations, images, and status are managed in the edit page.

### Edit Page (`/backoffice/distributives/:id/edit`)

This is the complex page. It needs:

1. **Basic fields section**: name, slug, featuredScore, status (publish/unpublish toggle)
2. **Categories section**: List of current categories + add/remove (async search for categories, client-side add via `addCategory`, remove via `removeCategory`)
3. **Attractions section**: Same pattern as categories
4. **Locations section**: Same pattern but with a role selector (DESTINATION/ORIGIN/WAYPOINT) when adding. Each location entry shows the location name + role badge
5. **Images section**: Media gallery management (if the project has a media picker component)
6. **Read-only computed fields**: `totalActivities`, `minPrice` (display only, auto-calculated by backend)

### Sub-Resource Pattern

For categories, attractions, and locations in the edit page:

1. Load the distributive via `DISTRIBUTIVE_REQUEST.findById(fetch, id)` in `+page.server.ts`
2. Display current items from the projection arrays (`distributive.categories`, etc.)
3. Client-side add: call `DISTRIBUTIVE_REQUEST.addCategory(fetch, id, { categoryId })`, then refresh the projection data
4. Client-side remove: call `DISTRIBUTIVE_REQUEST.removeCategory(fetch, id, categoryId)`, then refresh
5. No CQRS delay needed for sub-resource ops — but the projection data may take ~500ms to reflect the change. Consider optimistic local state updates or a short delay before re-fetching.

### Status (Publish/Unpublish)

Status is managed through the regular PATCH endpoint (not dedicated publish/unpublish endpoints):

```typescript
await DISTRIBUTIVE_REQUEST.update(fetch, id, { status: 'PUBLISHED' });
```

### Validation Rules

| Rule                                | UX Impact                        |
| ----------------------------------- | -------------------------------- |
| `name` required                     | Form validation                  |
| `slug` required, unique system-wide | Show error if slug taken         |
| `featuredScore` must be positive    | Number input with min=1          |
| Category must exist                 | Async search only shows existing |
| Attraction must exist               | Async search only shows existing |
| Location must exist                 | Async search only shows existing |

### Error Codes to Handle

| Code                                       | User Message                               |
| ------------------------------------------ | ------------------------------------------ |
| `DISTRIBUTIVE_ALREADY_EXISTS`              | A distributive with this ID already exists |
| `DISTRIBUTIVE_NOT_FOUND`                   | Distributive not found                     |
| `DISTRIBUTIVE_NOT_FOUND_BY_SLUG`           | Distributive not found (invalid slug)      |
| `DISTRIBUTIVE_FEATURED_SCORE_INVALID`      | Featured score must be a positive number   |
| `DISTRIBUTIVE_CATEGORIES_IN_USE_EXCEPTION` | Cannot remove categories in use            |
| `DISTRIBUTIVE_LOCATIONS_IN_USE_EXCEPTION`  | Cannot remove locations in use             |

---

## Relationships with Other Resources

| Resource         | Relationship                     | How it works                                                                                                                           |
| ---------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Category**     | Many-to-many                     | Add/remove via sub-resource endpoints. Names sync automatically                                                                        |
| **Attraction**   | Many-to-many                     | Add/remove via sub-resource endpoints. Names/descriptions sync automatically                                                           |
| **Location**     | One-to-many (entities with role) | Add/remove via sub-resource endpoints. Requires role (DESTINATION/ORIGIN/WAYPOINT)                                                     |
| **Tag**          | Managed externally               | Tags are added via the Tag Relationship context, not directly on the distributive                                                      |
| **Activity**     | Implicit (filter match)          | Activities are NOT linked to distributives directly. `totalActivities` counts published activities matching the distributive's filters |
| **Media/Images** | Via `mediaIds`                   | Images are managed through the multimedia system. The projection includes resolved `images[]` with variants                            |
| **FAQ**          | Managed externally               | FAQs are associated via FAQ relationships, reflected in `faqs[]`                                                                       |
| **Breadcrumbs**  | Auto-calculated                  | Navigation breadcrumbs derived from location hierarchy                                                                                 |

---

## Key Behavioral Notes

1. **CQRS eventual consistency**: After create/update/delete, the read projection takes ~500ms to propagate. Use `redirectDelayMs` in action factories.
2. **totalActivities is read-only**: It's recalculated by the backend whenever categories, attractions, locations, or tags change. Never send it in create/update DTOs.
3. **minPrice is read-only**: Calculated from matching activities. Display only.
4. **Locations need a generated UUID**: When adding a location, the frontend must generate the `id` (entity ID) in the request body. Use `crypto.randomUUID()`.
5. **Status toggle**: Use PATCH with `{ status: 'PUBLISHED' }` or `{ status: 'DRAFT' }`. No dedicated publish/unpublish endpoints.
6. **Slug uniqueness**: Validated across all catalog entities (activities, attractions, categories, locations, distributives, free tours) by the Slug context.
