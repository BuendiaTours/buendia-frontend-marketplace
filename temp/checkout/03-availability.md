# Checkout — Disponibilidad y Stock

## Modelo de disponibilidad

La disponibilidad opera en **dos niveles** independientes:

```
AvailabilityOption (slot)
├── availability: 40            ← Capacidad total del slot
├── reservedAvailability: 12    ← Passengers en proceso de reserva
│
├── Ticket "Adulto"
│   ├── stock: 25               ← Capacidad para este tipo de ticket
│   ├── reservedStock: 8        ← Passengers reservando este ticket
│   └── price: 2500             ← Precio en céntimos
│
├── Ticket "Niño"
│   ├── stock: 10
│   ├── reservedStock: 3
│   └── price: 1200
│
└── Addon "Audioguía"
    ├── addonId: uuid           ← ID del addon del catálogo
    ├── individualTicketId: uuid ← Para qué tipo de ticket es
    ├── stock: 20 (o null)      ← null = ilimitado
    └── price: 850
```

---

## Cómo calcular plazas disponibles

### Nivel de slot (disponibilidad general)

```
plazasDisponibles = availability - reservedAvailability
```

**Ejemplo:** `availability: 40`, `reservedAvailability: 12` → **28 plazas disponibles**

### Nivel de ticket (por tipo)

```
ticketsDisponibles = stock - (reservedStock ?? 0)
```

**Ejemplo:** `stock: 25`, `reservedStock: 8` → **17 tickets de este tipo disponibles**

### Caso especial: stock ilimitado

Si `stock` es `null`, el ticket tiene capacidad ilimitada. No se necesita validar stock para ese tipo de ticket.

```javascript
// Pseudocódigo para el frontend
function getAvailableTickets(ticket) {
	if (ticket.stock === null) return Infinity;
	return ticket.stock - (ticket.reservedStock ?? 0);
}
```

### Validación completa (lo que hace el backend)

Para que un booking sea válido, debe cumplir **ambos niveles**:

1. **Nivel slot:** `availability - reservedAvailability >= totalPassengers`
2. **Nivel ticket:** Para cada tipo de ticket, `stock - reservedStock >= passengersConEseTipoDeTicket`

---

## Estructura de la respuesta

```
GET /availability-options?optionId=uuid&sort=dateTime&order=ASC
```

```json
{
	"id": "b3a1f7e2-9c4d-4e8a-b6f1-2d3e4f5a6b7c",
	"activityId": "a1e2d3c4-5b6a-7f8e-9d0c-1b2a3f4e5d6c",
	"optionId": "7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b",
	"dateTime": "2026-07-15T21:00:00.000Z",
	"availability": 40,
	"reservedAvailability": 12,
	"tickets": [
		{
			"id": "f1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
			"price": 2500,
			"stock": 25,
			"reservedStock": 8
		},
		{
			"id": "a2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d",
			"price": 1200,
			"stock": 10,
			"reservedStock": 3
		},
		{
			"id": "b3c4d5e6-f7a8-9b0c-1d2e-3f4a5b6c7d8e",
			"price": 1800,
			"stock": 5,
			"reservedStock": 1
		}
	],
	"addons": [
		{
			"id": "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a",
			"addonId": "c9b8a7d6-e5f4-3c2b-1a0d-9e8f7c6b5a4d",
			"individualTicketId": "f1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
			"price": 850,
			"stock": 20
		},
		{
			"id": "f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c",
			"addonId": "d0c9b8a7-f6e5-4d3c-2b1a-0e9f8d7c6b5a",
			"individualTicketId": "f1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
			"price": 500,
			"stock": null
		}
	],
	"createdAt": "2026-06-01T10:30:00.000Z",
	"updatedAt": "2026-07-10T14:22:35.000Z"
}
```

### Descripción de campos

| Campo                         | Tipo           | Descripción                                          |
| ----------------------------- | -------------- | ---------------------------------------------------- |
| `id`                          | UUID           | ID interno de esta proyección de disponibilidad      |
| `activityId`                  | UUID           | Actividad a la que pertenece                         |
| `optionId`                    | UUID           | Opción/tarifa dentro de la actividad                 |
| `dateTime`                    | ISO 8601       | Fecha y hora del slot                                |
| `availability`                | number         | Capacidad total del slot                             |
| `reservedAvailability`        | number         | Plazas reservadas (en proceso de booking)            |
| `tickets`                     | array          | Tipos de ticket disponibles en este slot             |
| `tickets[].id`                | UUID           | ID del ticket (= `individualTicketId` para bookings) |
| `tickets[].price`             | number         | Precio en céntimos                                   |
| `tickets[].stock`             | number \| null | Capacidad del ticket (`null` = ilimitada)            |
| `tickets[].reservedStock`     | number \| null | Tickets reservados                                   |
| `addons`                      | array          | Extras disponibles para este slot                    |
| `addons[].id`                 | UUID           | ID interno del addon de disponibilidad               |
| `addons[].addonId`            | UUID           | ID del addon del catálogo                            |
| `addons[].individualTicketId` | UUID           | Para qué tipo de ticket aplica                       |
| `addons[].price`              | number         | Precio del addon en céntimos                         |
| `addons[].stock`              | number \| null | Stock del addon (`null` = ilimitado)                 |

---

## Ciclo de vida de las reservas

Las reservas de stock son **automáticas** y se gestionan por eventos del backend. El frontend no necesita hacer nada especial: al crear un booking, el stock se reserva automáticamente.

```
Evento del booking          │ Efecto en disponibilidad
────────────────────────────┼──────────────────────────────────────
Booking creado (PENDING)    │ +N reservedAvailability, +N reservedStock por ticket
Passenger añadido           │ +1 reservedAvailability, +1 reservedStock
Passenger eliminado         │ -1 reservedAvailability, -1 reservedStock
Booking confirmado          │ -N reservedAvailability, -N reservedStock (liberados)
Booking expirado            │ -N reservedAvailability, -N reservedStock (liberados)
Booking cancelado           │ -N reservedAvailability, -N reservedStock (liberados)
Booking fallido             │ -N reservedAvailability, -N reservedStock (liberados)
Booking eliminado           │ -N reservedAvailability, -N reservedStock (liberados)
```

> **Nota**: Cuando un booking se confirma (`CONFIRMED`), las reservas se liberan porque el slot ya está "consumido" — las plazas dejan de ser "reservadas" y pasan a ser "ocupadas" (reflejado en la disminución de `availability` por el sistema externo).

---

## Relación entre IDs

```
Catálogo                          Disponibilidad                  Checkout
────────                          ──────────────                  ────────
Activity
  └─ Option ──────────────────►   AvailabilityOption
       └─ IndividualTicket ───►     └─ ticket[] ─────────────►   Passenger.individualTicketId
       └─ Addon ──────────────►     └─ addon[]  ─────────────►   Booking.addons[].id
```

- El `optionId` del booking corresponde al `optionId` en disponibilidad.
- El `individualTicketId` de cada passenger corresponde al `id` de un ticket en disponibilidad.
- Los addons del booking referencian el `addonId` del catálogo, que se vincula con `addons[].addonId` en disponibilidad.

---

## Fechas y horas

- El campo `dateTime` en disponibilidad es un timestamp UTC completo: `2026-07-15T21:00:00.000Z`
- En el booking se envía como `activityDatetime` (ISO 8601) y el backend lo separa en `date` (YYYY-MM-DD) y `startTime` (HH:mm).
- La búsqueda de disponibilidad es por **coincidencia exacta** de `optionId` + `dateTime`, no por rango.

---

## Ejemplo práctico

**Escenario**: El usuario quiere reservar 2 adultos y 1 niño para el "Tour Nocturno" del 15 de julio a las 21:00.

**1. Consultar disponibilidad:**

```
GET /availability-options?optionId=7e8f9a0b-...&sort=dateTime&order=ASC
```

**2. Verificar que hay plazas** (con la respuesta del ejemplo anterior):

```javascript
const slot = response.data[0];

// Nivel slot: ¿hay 3 plazas?
const plazasLibres = slot.availability - slot.reservedAvailability; // 40 - 12 = 28 ✅

// Nivel ticket adulto: ¿hay 2?
const adulto = slot.tickets.find((t) => t.id === 'f1a2b3c4-...');
const adultosLibres = adulto.stock - adulto.reservedStock; // 25 - 8 = 17 ✅

// Nivel ticket niño: ¿hay 1?
const nino = slot.tickets.find((t) => t.id === 'a2b3c4d5-...');
const ninosLibres = nino.stock - nino.reservedStock; // 10 - 3 = 7 ✅
```

**3. Calcular precio (frontend, para mostrar):**

```javascript
const precioTotal = 2 * adulto.price + 1 * nino.price; // 2*2500 + 1*1200 = 6200 (62.00 EUR)
```

> **Importante**: El precio definitivo lo calcula el **servidor** al crear el booking. El frontend puede mostrarlo como estimación, pero el `subtotalPrice` del booking es la fuente de verdad.
