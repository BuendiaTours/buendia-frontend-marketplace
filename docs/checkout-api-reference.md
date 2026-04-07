# Checkout API — Referencia post-refactor para Frontend

> Documento de referencia para el equipo de frontend. Describe los endpoints, payloads simplificados y el flujo de checkout tras el refactor de resolucion de datos.

## Flujo de checkout

```text
1. POST /orders                          → Crear orden + primer booking (CART)
2. Completar bookings (en cualquier orden, repetible):
   ├── POST   /orders/:id/bookings       → Anadir booking adicional
   ├── PATCH  /bookings/:id              → Actualizar booking (pickup, dropoff, hotel, addons, answers...)
   ├── POST   /bookings/:id/passengers   → Anadir pasajeros
   ├── PATCH  /bookings/:bid/passengers/:pid → Actualizar pasajero (nombre, answers)
   ├── DELETE /bookings/:bid/passengers/:pid → Eliminar pasajero
   └── DELETE /bookings/:id              → Eliminar booking (si es el ultimo, elimina la orden)
3. PATCH /orders/:id                     → Completar datos de contacto (email, nombre, telefono, nacionalidad)
4. POST /orders/:id/checkout             → Transicion a CHECKING_OUT
5. GET  /orders/:id/validation           → Consultar si el carrito esta completo (sin mutar estado)
6. POST /orders/:id/reserve              → Validar completitud + calcular totales → PENDING_PAYMENT
7. POST /payments/authorize              → Crear pago + autorizar en Stripe → devuelve clientSecret
8. Confirmar pago en frontend con Stripe.js (usa clientSecret)
9. POST /payments/webhooks/stripe        → Stripe notifica resultado (backend gestiona automaticamente)
```

**Nota**: Los pasos 2-5 son iterativos. El frontend puede ir completando datos progresivamente. Las answers, pickup points, dropoff points, hotel y addons pueden enviarse vacios al principio e ir completandose con sucesivos PATCH. La validacion (paso 5) informa que falta sin bloquear. El bloqueo real ocurre al reservar (paso 6).

---

## Endpoints de mutacion — Payloads simplificados

### 1. Crear orden con primer booking

```text
POST /orders
```

```json
{
	"id": "uuid",
	"userId": "uuid",
	"booking": {
		"id": "uuid",
		"optionId": "uuid",
		"date": "2026-04-15",
		"activityDatetime": "2026-04-15T10:00:00.000Z",
		"passengers": [
			{ "id": "uuid-pax-1", "individualTicketId": "uuid", "isMainPax": true },
			{ "id": "uuid-pax-2", "individualTicketId": "uuid" }
		]
	}
}
```

| Campo                      | Obligatorio | Nota                                                          |
| -------------------------- | ----------- | ------------------------------------------------------------- |
| `id`                       | Si          | UUID de la orden (generado por el cliente)                    |
| `userId`                   | Si          | UUID del usuario                                              |
| `booking.id`               | Si          | UUID del booking (generado por el cliente)                    |
| `booking.optionId`         | Si          | UUID de la opcion de actividad del catalogo                   |
| `booking.date`             | Si          | Fecha del booking (ISO date)                                  |
| `booking.activityDatetime` | Si          | Fecha/hora de la actividad (ISO 8601 completo)                |
| `booking.passengers`       | Si          | Al menos 1 pasajero. Cada uno con `id` e `individualTicketId` |

**Resuelto por el backend**: activityId, bookingSystem, ticketKind, legibleId, snapshot, currency, priceAtBooking, unitCommission, group.

---

### 2. Anadir booking a orden existente

```text
POST /orders/:orderId/bookings
```

```json
{
	"id": "uuid",
	"optionId": "uuid",
	"date": "2026-04-15",
	"activityDatetime": "2026-04-15T10:00:00.000Z",
	"passengers": [
		{ "id": "uuid-pax-1", "individualTicketId": "uuid", "isMainPax": true },
		{ "id": "uuid-pax-2", "individualTicketId": "uuid" }
	],
	"pickupPoint": {
		"pickupPointId": "pp-central-001",
		"answers": [{ "questionId": "q-flight", "values": ["VY1234"] }]
	},
	"dropoffPoint": {
		"pickupPointId": "pp-hotel-arts"
	},
	"hotel": {
		"id": "123"
	},
	"addons": [{ "id": "uuid-addon", "quantity": 2 }],
	"bookingAnswers": [{ "questionId": "q-nationality", "values": ["Spanish"] }]
}
```

| Campo              | Obligatorio | Nota                                                          |
| ------------------ | ----------- | ------------------------------------------------------------- |
| `id`               | Si          | UUID del booking                                              |
| `optionId`         | Si          | UUID de la opcion de actividad                                |
| `date`             | Si          | Fecha del booking                                             |
| `activityDatetime` | Si          | Fecha/hora de la actividad (ISO 8601 completo)                |
| `passengers`       | Si          | Al menos 1 pasajero. Cada uno con `id` e `individualTicketId` |
| `pickupPoint`      | No          | Solo `pickupPointId` obligatorio. `answers` opcional          |
| `dropoffPoint`     | No          | Solo `pickupPointId` obligatorio. `answers` opcional          |
| `hotel`            | No          | Solo `id` del hotel. Siempre va acompanado de pickupPoint     |
| `addons`           | No          | Solo `id` + `quantity`. `answers` opcional                    |
| `bookingAnswers`   | No          | Solo `questionId` + `values`                                  |

**Resuelto por el backend**: activityId, bookingSystem, ticketKind, legibleId, snapshot, precios de pasajeros, nombre/direccion/coords del pickup/dropoff, nombre del hotel, precio del addon, descripcion de las answers.

---

### 3. Actualizar booking

```text
PATCH /bookings/:id
```

Todos los campos son opcionales. Solo enviar los que se quieran actualizar.

```json
{
	"activityDatetime": "2026-04-15T10:00:00.000Z",
	"pickupPoint": {
		"pickupPointId": "pp-central-001",
		"answers": [{ "questionId": "q-flight", "values": ["VY1234"] }]
	},
	"dropoffPoint": {
		"pickupPointId": "pp-hotel-arts",
		"answers": []
	},
	"hotel": {
		"id": "123"
	},
	"addons": [
		{ "id": "uuid-addon", "quantity": 1, "answers": [{ "questionId": "q-size", "values": ["L"] }] }
	],
	"bookingAnswers": [{ "questionId": "q-nationality", "values": ["Spanish"] }],
	"status": "CANCELLED"
}
```

| Campo              | Nota                                                        |
| ------------------ | ----------------------------------------------------------- |
| `activityDatetime` | Fecha/hora de la actividad (ISO 8601 completo)              |
| `pickupPoint`      | **Simplificado**. Solo `pickupPointId` + `answers` opcional |
| `dropoffPoint`     | **Simplificado**. Solo `pickupPointId` + `answers` opcional |
| `hotel`            | **Nuevo en update**. Solo `id`                              |
| `addons`           | **Nuevo en update**. `id` + `quantity` + `answers` opcional |
| `bookingAnswers`   | **Simplificado**. Solo `questionId` + `values`              |
| `status`           | Enum de estado                                              |
| `reserveExpiry`    | Fecha de expiracion de la reserva                           |
| `snapshot`         | Objeto libre                                                |

---

### 4. Actualizar orden

```text
PATCH /orders/:id
```

```json
{
	"contactEmail": "john@example.com",
	"contactFirstName": "John",
	"contactLastName": "Doe",
	"contactNationalityCountryCode": "ES",
	"contactPhone": "+34612345678"
}
```

Todos opcionales. Sin cambios respecto a la version actual.

---

### 5. Anadir pasajeros a booking

```text
POST /bookings/:id/passengers
```

```json
{
	"passengers": [{ "id": "uuid-pax-3", "individualTicketId": "uuid" }]
}
```

**Simplificado**: Antes usaba `tickets` con `quantity`. Ahora recibe pasajeros explicitos con IDs generados por el frontend.

---

### 6. Actualizar pasajero

```text
PATCH /bookings/:bookingId/passengers/:passengerId
```

```json
{
	"answers": [
		{ "questionId": "q-first-name", "values": ["John"] },
		{ "questionId": "q-last-name", "values": ["Doe"] },
		{ "questionId": "q-nationality", "values": ["Spanish"] }
	]
}
```

| Campo     | Nota                                                                                                             |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| `answers` | **Simplificado**. Solo `questionId` + `values`. Nombre y apellido ahora son answers como cualquier otra pregunta |

---

### 7. Checkout (transicion de estado)

```text
POST /orders/:id/checkout
```

Sin body. Mueve la orden de `CART` a `CHECKING_OUT`.

---

### 8. Consultar validacion

```text
GET /orders/:id/validation
```

Sin body. Devuelve si el carrito esta completo y una lista de issues:

```json
{
	"isComplete": false,
	"issues": [
		{ "bookingId": "uuid", "type": "MISSING_PICKUP_POINT", "detail": {} },
		{
			"bookingId": "uuid",
			"type": "MISSING_DROPOFF_POINT_ANSWER",
			"detail": { "questionId": "q-flight" }
		}
	]
}
```

Tipos de issue posibles:

- `MISSING_BOOKING_ANSWER` — Falta respuesta a pregunta de booking
- `MISSING_PASSENGER_ANSWER` — Falta respuesta a pregunta de pasajero
- `MISSING_PICKUP_POINT` — Falta pickup point cuando es requerido
- `MISSING_PICKUP_POINT_ANSWER` — Falta respuesta a pregunta del pickup point
- `MISSING_DROPOFF_POINT` — Falta dropoff point cuando es requerido
- `MISSING_DROPOFF_POINT_ANSWER` — Falta respuesta a pregunta del dropoff point
- `MISSING_ADDON_ANSWER` — Falta respuesta a pregunta del addon
- `NO_AVAILABILITY` — Sin disponibilidad para los pasajeros solicitados

---

### 9. Reservar orden

```text
POST /orders/:id/reserve
```

Sin body. Valida completitud, calcula totales y mueve a `PENDING_PAYMENT`. Falla si hay issues pendientes.

---

### 10. Autorizar pago

```text
POST /payments/authorize
```

```json
{
	"orderId": "uuid",
	"amount": 2500,
	"paymentMethod": "CARD"
}
```

Devuelve:

```json
{
	"externalId": "pi_3abc123def456",
	"clientSecret": "pi_3abc123def456_secret_xyz789",
	"status": "requires_capture"
}
```

El frontend usa `clientSecret` con Stripe.js para confirmar el pago. Sin cambios respecto a la version actual.

---

## Resumen de schemas simplificados

### AnswerInput (antes y despues)

```text
ANTES: { questionId, description, values }
AHORA: { questionId, values }
```

`description` se resuelve desde el catalogo de preguntas. Aplica a TODAS las answers (booking, passenger, pickup, dropoff, addon).

### PickupPoint / DropoffPoint (antes y despues)

```text
ANTES: { id, pickupPointId, name, address?, city?, countryCode?, postCode?, coords?, answers? }
AHORA: { pickupPointId, answers? }
```

`id` se genera server-side. `name`, `address`, `city`, `countryCode`, `postCode`, `coords` se resuelven del catalogo.

### Hotel (antes y despues)

```text
ANTES: { id, name }
AHORA: { id }
```

`name` se resuelve del catalogo (pickup_points.hotels). Siempre va acompanado de un pickupPoint.

### Addon (antes y despues)

```text
ANTES: { id, quantity, unitPrice, answers? }
AHORA: { id, quantity, answers? }
```

`unitPrice` se resuelve desde availability-addon (precio real segun fecha/slot/ticket).

### Passengers (antes y despues)

```text
ANTES: tickets: [{ individualTicketId, quantity }] → backend expande a N passengers con IDs server-side
AHORA: passengers: [{ id, individualTicketId, isMainPax? }]
```

El frontend genera los IDs. `isMainPax` se marca explicitamente. `priceAtBooking`, `unitCommission` y `group` se resuelven del catalogo. `firstName` y `lastName` se eliminan como campos del pasajero — pasan a ser answers.

---

## Diagrama de estados de la orden

```text
CART → CHECKING_OUT → PENDING_PAYMENT → RESERVED → COMPLETED
                                  ↓
                               FAILED → PENDING_PAYMENT (retry)
                                  ↓
                              CANCELLED
```

## Diagrama de estados del pago

```text
PENDING → ON_HOLD → COMPLETED → REFUNDED
              ↓         ↓
           FAILED    CANCELLED
              ↓
           PENDING (retry, incrementa retries)
```
