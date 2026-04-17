# Normalización de included/excluded en Activity

## Contexto

Los campos `included` (qué incluye la actividad) y `excluded` (qué no incluye) han cambiado en el backend de **texto libre** (`string[]`) a **enums cerrados** (`ActivityIncluded[]` / `ActivityExcluded[]`).

Esto ya está reflejado en los ficheros de API contracts del frontend:

- `src/core/activities/enums.ts` — nuevos enums `ActivityIncluded` y `ActivityExcluded`
- `src/core/activities/types.ts` — tipos `Activity`, `ActivityUpdateDto` actualizados

El objetivo es adaptar los formularios del backoffice para que usen un componente de selección de enum en lugar del campo de texto libre actual.

---

## Cambios realizados en el backend

### Nuevos enums

**`ActivityIncluded`** (21 valores):

| Valor                          | Texto (ES)                           |
| ------------------------------ | ------------------------------------ |
| `TICKETS_INCLUDED`             | Entradas incluidas                   |
| `TICKETS_INCLUDED_BY_MODALITY` | Entradas incluidas (según modalidad) |
| `SKIP_THE_LINE`                | Sin colas                            |
| `GUIDED_TOUR`                  | Visita guiada                        |
| `EXPERT_GUIDE`                 | Guía experto                         |
| `EXPERT_GUIDE_SPANISH`         | Guía experto en español              |
| `LOCAL_GUIDE_SPANISH`          | Guía local en español                |
| `BUENDIA_TOUR_MANAGER`         | Tour manager de Buendía              |
| `AUDIO_GUIDE_SPANISH`          | Audioguía en español                 |
| `AUDIO_GUIDE_ENGLISH`          | Audioguía en inglés                  |
| `AUDIO_GUIDE_CHINESE`          | Audioguía en chino                   |
| `WIRELESS_RADIO_GUIDE`         | Sistema de radioguía inalámbrico     |
| `HEADPHONES`                   | Auriculares                          |
| `PRIVATE_BUS`                  | Autobús privado                      |
| `PRIVATE_BOAT`                 | Barco privado                        |
| `PRIVATE_TRAIN`                | Tren privado                         |
| `PRIVATE_VEHICLE`              | Vehículo privado                     |
| `PUBLIC_TRANSPORT_TRAIN`       | Transporte público: Tren             |
| `PUBLIC_TRANSPORT_BUS`         | Transporte público: Autobús          |
| `PUBLIC_TRANSPORT_FERRY`       | Transporte público: Ferry            |
| `HOTEL_PICKUP`                 | Recogida en hotel                    |

**`ActivityExcluded`** (10 valores):

| Valor                        | Texto (ES)                             |
| ---------------------------- | -------------------------------------- |
| `TRANSPORT_TO_MEETING_POINT` | Transporte hasta el punto de encuentro |
| `TICKETS`                    | Entradas                               |
| `TRANSPORT_TICKET`           | Ticket de transporte                   |
| `GUIDED_TOUR`                | Visita guiada                          |
| `INTERIOR_VISITS`            | Visitas interiores                     |
| `FOOD_AND_DRINKS`            | Comidas y bebidas                      |
| `TIPS`                       | Propinas                               |
| `HEADPHONES`                 | Auriculares                            |
| `SPORTS_EQUIPMENT`           | Equipamiento deportivo                 |
| `OTHER`                      | Otros                                  |

### API contract

El backend ahora **valida** con `@IsEnum` cada elemento del array. Si se envía un string que no es un valor del enum, devuelve 400.

```
PATCH /activities/:id
{
  "included": ["GUIDED_TOUR", "PRIVATE_BUS"],
  "excluded": ["FOOD_AND_DRINKS", "TIPS"]
}
```

---

## Estado actual del frontend (antes de los cambios)

### Formulario de edición

**Fichero**: `src/routes/(backoffice)/backoffice/activities/[id]/edit/+page.svelte`

Actualmente usa `FormOrderedStringList` para ambos campos (líneas ~144-158):

```svelte
<FormOrderedStringList
	id="included"
	label={m.activities_labelIncluded()}
	bind:items={$form.included}
	error={$errors.included?._errors}
	placeholder={m.activities_placeholderIncluded()}
/>

<FormOrderedStringList
	id="excluded"
	label={m.activities_labelExcluded()}
	bind:items={$form.excluded}
	error={$errors.excluded?._errors}
	placeholder={m.activities_placeholderExcluded()}
/>
```

### Schema

**Fichero**: `src/routes/(backoffice)/backoffice/activities/schemas/activity-edit.schema.ts`

```typescript
included: z.array(z.string()).default([]),
excluded: z.array(z.string()).default([]),
```

### Server load

**Fichero**: `src/routes/(backoffice)/backoffice/activities/[id]/edit/+page.server.ts`

```typescript
included: activity.included ?? [],
excluded: activity.excluded ?? [],
```

---

## Patrón de referencia: `restrictions` y `notSuitableFor`

Estos campos YA usan enums con el patrón correcto. Seguir este mismo patrón.

### 1. Opciones de labels

**Fichero**: `src/lib/labels/activities.ts`

```typescript
export const ACTIVITY_RESTRICTION_OPTIONS = [
	{ id: ActivityRestriction.ALCOHOL, name: m.enum_activityRestriction_alcohol() },
	{ id: ActivityRestriction.SMOKING, name: m.enum_activityRestriction_smoking() },
	{ id: ActivityRestriction.PETS, name: m.enum_activityRestriction_pets() },
	{ id: ActivityRestriction.OTHER, name: m.enum_activityRestriction_other() }
];
```

### 2. Schema (objetos con id + name)

```typescript
restrictions: z.array(z.object({ id: z.string(), name: z.string() })).default([]),
```

### 3. Server load (mapeo de enum a objeto con label)

```typescript
restrictions: (activity.restrictions ?? []).map((r) => {
  const option = ACTIVITY_RESTRICTION_OPTIONS.find((o) => o.id === r);
  return { id: r, name: option?.name ?? r };
}),
```

### 4. Save transform (extraer solo los IDs)

```typescript
transformData: ({ restrictions, notSuitableFor, ...rest }) => ({
	...rest,
	restrictions: (restrictions ?? []).map((r) => r.id),
	notSuitableFor: (notSuitableFor ?? []).map((n) => n.id)
});
```

### 5. Componente en el formulario

```svelte
<FormCheckboxGroup
	main_label={m.activities_labelRestrictions()}
	id="restrictions"
	name="restrictions[]"
	key_title="name"
	key_value="id"
	bind:items={$form.restrictions}
	availableItems={ACTIVITY_RESTRICTION_OPTIONS}
	error={$errors.restrictions?._errors}
	wrapperClass="md:col-span-6"
/>
```

---

## Cambios a implementar

### 1. Traducciones i18n

**Fichero**: `messages/es/activities.json` (y sus equivalentes en otros idiomas)

Añadir claves de traducción para cada valor de los dos enums:

```json
"enum_activityIncluded_ticketsIncluded": "Entradas incluidas",
"enum_activityIncluded_ticketsIncludedByModality": "Entradas incluidas (según modalidad)",
"enum_activityIncluded_skipTheLine": "Sin colas",
"enum_activityIncluded_guidedTour": "Visita guiada",
"enum_activityIncluded_expertGuide": "Guía experto",
"enum_activityIncluded_expertGuideSpanish": "Guía experto en español",
"enum_activityIncluded_localGuideSpanish": "Guía local en español",
"enum_activityIncluded_buendiaTourManager": "Tour manager de Buendía",
"enum_activityIncluded_audioGuideSpanish": "Audioguía en español",
"enum_activityIncluded_audioGuideEnglish": "Audioguía en inglés",
"enum_activityIncluded_audioGuideChinese": "Audioguía en chino",
"enum_activityIncluded_wirelessRadioGuide": "Sistema de radioguía inalámbrico",
"enum_activityIncluded_headphones": "Auriculares",
"enum_activityIncluded_privateBus": "Autobús privado",
"enum_activityIncluded_privateBoat": "Barco privado",
"enum_activityIncluded_privateTrain": "Tren privado",
"enum_activityIncluded_privateVehicle": "Vehículo privado",
"enum_activityIncluded_publicTransportTrain": "Transporte público: Tren",
"enum_activityIncluded_publicTransportBus": "Transporte público: Autobús",
"enum_activityIncluded_publicTransportFerry": "Transporte público: Ferry",
"enum_activityIncluded_hotelPickup": "Recogida en hotel",

"enum_activityExcluded_transportToMeetingPoint": "Transporte hasta el punto de encuentro",
"enum_activityExcluded_tickets": "Entradas",
"enum_activityExcluded_transportTicket": "Ticket de transporte",
"enum_activityExcluded_guidedTour": "Visita guiada",
"enum_activityExcluded_interiorVisits": "Visitas interiores",
"enum_activityExcluded_foodAndDrinks": "Comidas y bebidas",
"enum_activityExcluded_tips": "Propinas",
"enum_activityExcluded_headphones": "Auriculares",
"enum_activityExcluded_sportsEquipment": "Equipamiento deportivo",
"enum_activityExcluded_other": "Otros"
```

### 2. Opciones de labels

**Fichero**: `src/lib/labels/activities.ts`

Crear dos nuevos arrays de opciones siguiendo el patrón de `ACTIVITY_RESTRICTION_OPTIONS`:

```typescript
export const ACTIVITY_INCLUDED_OPTIONS = [
	{ id: ActivityIncluded.TICKETS_INCLUDED, name: m.enum_activityIncluded_ticketsIncluded() },
	{
		id: ActivityIncluded.TICKETS_INCLUDED_BY_MODALITY,
		name: m.enum_activityIncluded_ticketsIncludedByModality()
	}
	// ... todos los 21 valores
];

export const ACTIVITY_EXCLUDED_OPTIONS = [
	{
		id: ActivityExcluded.TRANSPORT_TO_MEETING_POINT,
		name: m.enum_activityExcluded_transportToMeetingPoint()
	},
	{ id: ActivityExcluded.TICKETS, name: m.enum_activityExcluded_tickets() }
	// ... todos los 10 valores
];
```

### 3. Schema

**Fichero**: `src/routes/(backoffice)/backoffice/activities/schemas/activity-edit.schema.ts`

Cambiar:

```typescript
// Antes
included: z.array(z.string()).default([]),
excluded: z.array(z.string()).default([]),

// Después
included: z.array(z.object({ id: z.string(), name: z.string() })).default([]),
excluded: z.array(z.object({ id: z.string(), name: z.string() })).default([]),
```

### 4. Server load

**Fichero**: `src/routes/(backoffice)/backoffice/activities/[id]/edit/+page.server.ts`

Cambiar el mapeo de datos al cargar (como se hace con `restrictions`):

```typescript
// Antes
included: activity.included ?? [],
excluded: activity.excluded ?? [],

// Después
included: (activity.included ?? []).map((i) => {
  const option = ACTIVITY_INCLUDED_OPTIONS.find((o) => o.id === i);
  return { id: i, name: option?.name ?? i };
}),
excluded: (activity.excluded ?? []).map((e) => {
  const option = ACTIVITY_EXCLUDED_OPTIONS.find((o) => o.id === e);
  return { id: e, name: option?.name ?? e };
}),
```

### 5. Save transform

**Fichero**: `src/routes/(backoffice)/backoffice/activities/[id]/edit/+page.server.ts`

En el `transformData`, añadir la extracción de IDs:

```typescript
transformData: ({ included, excluded, restrictions, notSuitableFor, ...rest }) => ({
	...rest,
	included: (included ?? []).map((i) => i.id),
	excluded: (excluded ?? []).map((e) => e.id),
	restrictions: (restrictions ?? []).map((r) => r.id),
	notSuitableFor: (notSuitableFor ?? []).map((n) => n.id)
});
```

### 6. Componente en el formulario

**Fichero**: `src/routes/(backoffice)/backoffice/activities/[id]/edit/+page.svelte`

Reemplazar los `FormOrderedStringList` por `FormCheckboxGroup`:

```svelte
<!-- Antes -->
<FormOrderedStringList
	id="included"
	label={m.activities_labelIncluded()}
	bind:items={$form.included}
	error={$errors.included?._errors}
	placeholder={m.activities_placeholderIncluded()}
/>

<!-- Después -->
<FormCheckboxGroup
	main_label={m.activities_labelIncluded()}
	id="included"
	name="included[]"
	key_title="name"
	key_value="id"
	bind:items={$form.included}
	availableItems={ACTIVITY_INCLUDED_OPTIONS}
	error={$errors.included?._errors}
	wrapperClass="md:col-span-6"
/>
```

Lo mismo para `excluded`:

```svelte
<FormCheckboxGroup
	main_label={m.activities_labelExcluded()}
	id="excluded"
	name="excluded[]"
	key_title="name"
	key_value="id"
	bind:items={$form.excluded}
	availableItems={ACTIVITY_EXCLUDED_OPTIONS}
	error={$errors.excluded?._errors}
	wrapperClass="md:col-span-6"
/>
```

### 7. Marketplace (display)

**Fichero**: `src/routes/(marketplace)/actividad/[slug]/+page.svelte`

Actualmente intenta acceder a `item.description` (línea ~249) pero eso era un bug. Ahora que los valores son enums, hay que mapear a texto traducido:

```svelte
<!-- Antes (con bug) -->
{#each activity.included ?? [] as item}
	<span>{item.description}</span>
{/each}

<!-- Después -->
{#each activity.included ?? [] as item}
	<span>{ACTIVITY_INCLUDED_OPTIONS.find((o) => o.id === item)?.name ?? item}</span>
{/each}

{#each activity.excluded ?? [] as item}
	<span>{ACTIVITY_EXCLUDED_OPTIONS.find((o) => o.id === item)?.name ?? item}</span>
{/each}
```

---

## Ficheros afectados (resumen)

| Fichero                                                  | Cambio                                                          |
| -------------------------------------------------------- | --------------------------------------------------------------- |
| `messages/es/activities.json`                            | Añadir claves i18n para los 31 valores de enum                  |
| `src/lib/labels/activities.ts`                           | Crear `ACTIVITY_INCLUDED_OPTIONS` y `ACTIVITY_EXCLUDED_OPTIONS` |
| `src/routes/.../schemas/activity-edit.schema.ts`         | Cambiar schema de `z.string()` a `z.object({ id, name })`       |
| `src/routes/.../[id]/edit/+page.server.ts`               | Mapeo en load + transformData en save                           |
| `src/routes/.../[id]/edit/+page.svelte`                  | Reemplazar `FormOrderedStringList` por `FormCheckboxGroup`      |
| `src/routes/(marketplace)/actividad/[slug]/+page.svelte` | Mapear enum a texto traducido                                   |

## Notas

- Los datos existentes de texto libre se han descartado en el backend. Las actividades que tenían valores antiguos tendrán arrays vacíos.
- El backend valida con `@IsEnum` — si se envía un valor que no está en el enum, devuelve 400.
- Estos mismos enums se usarán también en Free Tours en el futuro (mismos valores).
