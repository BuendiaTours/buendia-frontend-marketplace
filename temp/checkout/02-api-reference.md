# Checkout — API Reference

## Índice

- [Order](#order)
  - [Crear order con primer booking](#crear-order-con-primer-booking)
  - [Añadir booking a order existente](#añadir-booking-a-order-existente)
  - [Actualizar order](#actualizar-order)
  - [Iniciar checkout](#iniciar-checkout)
  - [Reservar](#reservar)
  - [Validar carrito](#validar-carrito)
  - [Obtener order por ID](#obtener-order-por-id)
  - [Buscar orders](#buscar-orders)
  - [Expirar orders](#expirar-orders)
- [Booking](#booking)
  - [Actualizar booking](#actualizar-booking)
  - [Eliminar booking](#eliminar-booking)
  - [Añadir passengers](#añadir-passengers)
  - [Actualizar passenger](#actualizar-passenger)
  - [Eliminar passenger](#eliminar-passenger)
  - [Obtener booking por ID](#obtener-booking-por-id)
  - [Buscar bookings](#buscar-bookings)
- [Payment](#payment)
  - [Autorizar pago](#autorizar-pago)
  - [Crear pago](#crear-pago)
  - [Obtener payment por ID](#obtener-payment-por-id)
  - [Buscar payments](#buscar-payments)
- [Availability](#availability)
  - [Buscar disponibilidad](#buscar-disponibilidad)

---

## Order

### Crear order con primer booking

```
POST /orders
```

Crea una order en estado `CART` junto con su primer booking. El booking debe incluir al menos un passenger.

**Request body:**

```json
{
	"id": "uuid",
	"userId": "uuid",
	"booking": {
		"id": "uuid",
		"optionId": "uuid",
		"activityDatetime": "2026-07-15T21:00:00.000Z",
		"passengers": [
			{
				"id": "uuid",
				"individualTicketId": "uuid"
			}
		]
	}
}
```

| Campo                                     | Tipo     | Requerido | Descripción                                |
| ----------------------------------------- | -------- | --------- | ------------------------------------------ |
| `id`                                      | UUID     | Sí        | ID de la order (generado por el cliente)   |
| `userId`                                  | UUID     | Sí        | ID del usuario propietario                 |
| `booking.id`                              | UUID     | Sí        | ID del booking (generado por el cliente)   |
| `booking.optionId`                        | UUID     | Sí        | ID de la opción/tarifa del catálogo        |
| `booking.activityDatetime`                | ISO 8601 | Sí        | Fecha y hora de la actividad               |
| `booking.passengers[].id`                 | UUID     | Sí        | ID del passenger (generado por el cliente) |
| `booking.passengers[].individualTicketId` | UUID     | Sí        | Tipo de ticket del catálogo                |

**Response:** `200 OK` (sin body)

**Datos generados por el servidor:**

- `legibleId` de order y booking
- `currency` (default: EUR)
- Datos de la actividad resueltos desde el catálogo
- Precios de cada passenger resueltos desde el catálogo

---

### Añadir booking a order existente

```
POST /orders/:id/bookings
```

Añade un nuevo booking a una order existente. Solo permitido en estado `CART`.

**Request body:**

```json
{
	"id": "uuid",
	"optionId": "uuid",
	"activityDatetime": "2026-07-16T10:00:00.000Z",
	"passengers": [
		{
			"id": "uuid",
			"individualTicketId": "uuid"
		}
	]
}
```

**Response:** `200 OK` (sin body)

---

### Actualizar order

```
PATCH /orders/:id
```

Actualiza los datos de contacto y/o totalAmount de la order. Solo permitido en `CART` o `CHECKING_OUT`.

**Request body** (todos los campos son opcionales):

```json
{
	"contactEmail": "cliente@email.com",
	"contactFirstName": "Juan",
	"contactLastName": "García",
	"contactPhone": "+34612345678",
	"contactNationalityCountryCode": "ES",
	"totalAmount": 5000
}
```

| Campo                           | Tipo   | Validación                    |
| ------------------------------- | ------ | ----------------------------- |
| `contactEmail`                  | string | Email válido                  |
| `contactFirstName`              | string | No vacío                      |
| `contactLastName`               | string | No vacío                      |
| `contactPhone`                  | string | No vacío                      |
| `contactNationalityCountryCode` | string | No vacío (ISO 3166-1 alpha-2) |
| `totalAmount`                   | number | >= 0 (en céntimos)            |

**Response:** `200 OK` (sin body)

---

### Iniciar checkout

```
POST /orders/:id/checkout
```

Transiciona la order de `CART` a `CHECKING_OUT`. Bloquea la creación/eliminación de bookings y passengers. Permite seguir actualizando answers de passengers.

**Request body:** vacío

**Response:** `200 OK` (sin body)

**Precondiciones:**

- La order debe estar en estado `CART`

---

### Reservar

```
POST /orders/:id/reserve
```

Valida el carrito completo y transiciona de `CHECKING_OUT` a `PENDING_PAYMENT`. Calcula los totales definitivos.

**Request body:** vacío

**Response:** `200 OK` (sin body)

**Precondiciones:**

- La order debe estar en estado `CHECKING_OUT`
- El carrito debe estar completo (ver [documento de validaciones](./04-validations.md))

**Posibles errores:**

- `ORDER_INCOMPLETE_CART` — Faltan datos obligatorios (contacto, passengers, answers, etc.)
- `ORDER_NO_AVAILABILITY` — No hay disponibilidad para algún booking
- `ORDER_NO_TICKET_STOCK` — Stock insuficiente para algún tipo de ticket

---

### Validar carrito

```
GET /orders/:id/validation
```

Endpoint de solo lectura que verifica si el carrito está completo. **No cambia el estado de la order.** Útil para mostrar errores de validación en el frontend antes de intentar reservar.

**Response:**

```json
{
	"isComplete": false,
	"issues": [
		{
			"bookingId": "uuid",
			"type": "MISSING_PASSENGER_ANSWER",
			"detail": {
				"passengerId": "uuid",
				"questionId": "uuid"
			}
		},
		{
			"bookingId": "uuid",
			"type": "MISSING_PICKUP_POINT",
			"detail": {}
		}
	],
	"reasons": [
		"Booking abc123: missing passenger answer for question xyz",
		"Booking abc123: missing pickup point"
	]
}
```

| Campo                | Tipo     | Descripción                              |
| -------------------- | -------- | ---------------------------------------- |
| `isComplete`         | boolean  | `true` si no hay issues                  |
| `issues`             | array    | Lista detallada de problemas por booking |
| `issues[].bookingId` | string   | ID del booking con el problema           |
| `issues[].type`      | string   | Tipo de issue (ver tabla abajo)          |
| `issues[].detail`    | object   | Contexto adicional del problema          |
| `reasons`            | string[] | Descripciones legibles de los problemas  |

**Tipos de issue:**

| Tipo                                 | Descripción                                             |
| ------------------------------------ | ------------------------------------------------------- |
| `NO_AVAILABILITY`                    | No hay slots disponibles para la fecha/hora del booking |
| `NO_TICKET_STOCK`                    | Stock insuficiente para un tipo de ticket               |
| `EXCEEDS_MAX_TICKETS_PER_INDIVIDUAL` | Se excede el límite de tickets por persona              |
| `MISSING_PICKUP_POINT`               | Pickup point requerido pero no seleccionado             |
| `MISSING_DROPOFF_POINT`              | Dropoff point requerido pero no seleccionado            |
| `MISSING_BOOKING_ANSWER`             | Pregunta obligatoria de booking sin responder           |
| `MISSING_PASSENGER_ANSWER`           | Pregunta obligatoria de passenger sin responder         |
| `MISSING_ADDON_ANSWER`               | Pregunta obligatoria de addon sin responder             |
| `MISSING_PICKUP_POINT_ANSWER`        | Pregunta de pickup point sin responder                  |
| `MISSING_DROPOFF_POINT_ANSWER`       | Pregunta de dropoff point sin responder                 |

---

### Obtener order por ID

```
GET /orders/:id
```

**Response:**

```json
{
	"id": "uuid",
	"userId": "uuid",
	"contactEmail": "cliente@email.com",
	"contactFirstName": "Juan",
	"contactLastName": "García",
	"contactNationalityCountryCode": "ES",
	"contactPhone": "+34612345678",
	"currency": "EUR",
	"expiresAt": "2026-07-15T21:20:00.000Z",
	"status": "CART",
	"totalAmount": 5000,
	"totalCommission": 500,
	"createdAt": "2026-07-15T21:00:00.000Z",
	"updatedAt": "2026-07-15T21:05:00.000Z"
}
```

---

### Buscar orders

```
GET /orders
```

**Query params:**

| Param          | Tipo            | Descripción                   |
| -------------- | --------------- | ----------------------------- |
| `userId`       | UUID            | Filtrar por usuario           |
| `status`       | OrderStatusEnum | Filtrar por estado            |
| `contactEmail` | string          | Filtrar por email             |
| `skip`         | number          | Offset de paginación          |
| `limit`        | number          | Límite de resultados          |
| `sort`         | string          | Campo de ordenación           |
| `order`        | `ASC` \| `DESC` | Dirección de ordenación       |
| `operator`     | `AND` \| `OR`   | Operador lógico entre filtros |

---

### Expirar orders

```
POST /orders/expire-orders
```

Expira todas las orders cuyo `expiresAt` ha pasado. Llamado por un cron job o manualmente.

**Request body:** vacío

**Response:** `200 OK` (sin body)

---

## Booking

### Actualizar booking

```
PATCH /bookings/:id
```

Actualiza campos del booking. Los campos no enviados no se modifican.

**Request body** (todos los campos son opcionales):

```json
{
	"addons": [
		{
			"id": "uuid",
			"quantity": 2,
			"answers": [
				{
					"questionId": "uuid",
					"values": ["M"]
				}
			]
		}
	],
	"bookingAnswers": [
		{
			"questionId": "uuid",
			"values": ["Special dietary requirements"]
		}
	],
	"pickupPoint": {
		"pickupPointId": "uuid",
		"answers": [
			{
				"questionId": "uuid",
				"values": ["Room 405"]
			}
		]
	},
	"dropoffPoint": {
		"pickupPointId": "uuid"
	},
	"hotel": {
		"id": 42
	}
}
```

**Sub-tipos:**

**Addon:**

| Campo      | Tipo     | Requerido | Descripción                      |
| ---------- | -------- | --------- | -------------------------------- |
| `id`       | UUID     | Sí        | ID del addon del catálogo        |
| `quantity` | number   | Sí        | Cantidad (mínimo 1)              |
| `answers`  | Answer[] | No        | Respuestas a preguntas del addon |

**Answer:**

| Campo        | Tipo     | Requerido | Descripción                    |
| ------------ | -------- | --------- | ------------------------------ |
| `questionId` | UUID     | Sí        | ID de la pregunta del catálogo |
| `values`     | string[] | Sí        | Valores de la respuesta        |

**PickupPoint / DropoffPoint:**

| Campo           | Tipo     | Requerido | Descripción                      |
| --------------- | -------- | --------- | -------------------------------- |
| `pickupPointId` | UUID     | Sí        | ID del punto del catálogo        |
| `answers`       | Answer[] | No        | Respuestas a preguntas del punto |

**Hotel:**

| Campo | Tipo   | Requerido | Descripción                          |
| ----- | ------ | --------- | ------------------------------------ |
| `id`  | number | Sí        | ID del hotel del catálogo (mínimo 1) |

**Response:** `200 OK` (sin body)

---

### Eliminar booking

```
DELETE /bookings/:id
```

Elimina un booking del carrito. Si la order queda sin bookings, se elimina la order también.

**Response:** `200 OK` (sin body)

---

### Añadir passengers

```
POST /bookings/:id/passengers
```

Añade uno o más passengers a un booking existente. Solo permitido con order en `CART` o `CHECKING_OUT`.

**Request body:**

```json
{
	"passengers": [
		{
			"id": "uuid",
			"individualTicketId": "uuid"
		},
		{
			"id": "uuid",
			"individualTicketId": "uuid"
		}
	]
}
```

**Response:** `200 OK` (sin body)

> El servidor resuelve automáticamente el precio, grupo y comisión de cada passenger desde el catálogo.

---

### Actualizar passenger

```
PATCH /bookings/:bookingId/passengers/:passengerId
```

Actualiza las answers y/o flag `isMainPax` de un passenger. Las answers permitidas dependen del `target: PASSENGER` en el catálogo de preguntas.

**Request body** (todos los campos son opcionales):

```json
{
	"answers": [
		{
			"questionId": "uuid",
			"values": ["Juan"]
		},
		{
			"questionId": "uuid",
			"values": ["García"]
		},
		{
			"questionId": "uuid",
			"values": ["1990-05-15"]
		}
	],
	"isMainPax": true
}
```

**Response:** `200 OK` (sin body)

> **Nota sobre estados**: Este endpoint tiene restricciones de estado diferentes según la operación:
>
> - En `CART` o `CHECKING_OUT`: se pueden actualizar answers e isMainPax

---

### Eliminar passenger

```
DELETE /bookings/:bookingId/passengers/:passengerId
```

Elimina un passenger del booking. No se puede eliminar el último passenger (mínimo 1 por booking).

**Response:** `200 OK` (sin body)

**Posibles errores:**

- `BOOKING_REQUIRES_AT_LEAST_ONE_PASSENGER` — No se puede dejar un booking sin passengers
- `BOOKING_PASSENGER_NOT_FOUND` — El passenger no existe en este booking

---

### Obtener booking por ID

```
GET /bookings/:id
```

**Response:**

```json
{
	"id": "uuid",
	"orderId": "uuid",
	"activityId": "uuid",
	"legibleId": "BK-2026-00142",
	"optionId": "uuid",
	"startTime": "21:00",
	"date": "2026-07-15",
	"status": "PENDING",
	"bookingSystem": "BOKUN",
	"ticketKind": "INDIVIDUAL",
	"subtotalPrice": 5000,
	"subtotalCommission": 500,
	"confirmationCode": null,
	"externalBookingId": null,
	"reserveExpiry": null,
	"lastError": null,
	"passengers": [
		{
			"id": "uuid",
			"individualTicketId": "uuid",
			"group": "ADULT",
			"priceAtBooking": 2500,
			"unitCommission": 250,
			"isMainPax": true,
			"answers": [
				{
					"questionId": "uuid",
					"description": "First Name",
					"values": ["Juan"]
				}
			]
		}
	],
	"addons": [
		{
			"id": "uuid",
			"quantity": 1,
			"priceAtBooking": 850,
			"answers": []
		}
	],
	"bookingAnswers": [
		{
			"questionId": "uuid",
			"description": "Special requirements",
			"values": ["Vegetarian diet"]
		}
	],
	"pickupPoint": {
		"pickupPointId": "uuid",
		"answers": []
	},
	"dropoffPoint": null,
	"hotel": null,
	"paymentData": null,
	"vouchers": [],
	"snapshot": { "...": "datos de auditoría del catálogo" },
	"createdAt": "2026-07-15T21:00:00.000Z",
	"updatedAt": "2026-07-15T21:05:00.000Z"
}
```

**Campo `lastError`** (presente cuando el booking system reporta error):

```json
{
	"lastError": {
		"errorMessage": "Insufficient availability in external system",
		"errorType": "AVAILABILITY_ERROR",
		"attempt": 2,
		"maxAttempts": 3
	}
}
```

---

### Buscar bookings

```
GET /bookings
```

**Query params:**

| Param        | Tipo              | Descripción                    |
| ------------ | ----------------- | ------------------------------ |
| `activityId` | UUID              | Filtrar por actividad          |
| `legibleId`  | string            | Filtrar por referencia legible |
| `orderId`    | UUID              | Filtrar por order              |
| `status`     | BookingStatusEnum | Filtrar por estado             |
| `skip`       | number            | Offset de paginación           |
| `limit`      | number            | Límite de resultados           |
| `sort`       | string            | Campo de ordenación            |
| `order`      | `ASC` \| `DESC`   | Dirección                      |
| `operator`   | `AND` \| `OR`     | Operador lógico                |

---

## Payment

### Autorizar pago

```
POST /payments/authorize
```

Crea un payment y lo autoriza con Stripe (crea un PaymentIntent). Devuelve el `clientSecret` para que el frontend confirme el pago con Stripe Elements.

**Request body:**

```json
{
	"orderId": "uuid",
	"amount": 5000,
	"paymentMethod": "CARD",
	"metadata": {
		"customField": "value"
	}
}
```

| Campo           | Tipo   | Requerido | Descripción                |
| --------------- | ------ | --------- | -------------------------- |
| `orderId`       | UUID   | Sí        | ID de la order asociada    |
| `amount`        | number | Sí        | Monto en céntimos          |
| `paymentMethod` | enum   | Sí        | Método de pago (ver tabla) |
| `metadata`      | object | No        | Metadata personalizada     |

**Métodos de pago disponibles:** `CARD`, `APPLE_PAY`, `GOOGLE_PAY`, `BANK_TRANSFER`

**Response:**

```json
{
	"externalId": "pi_3ABC123DEF456",
	"clientSecret": "pi_3ABC123DEF456_secret_xyz789",
	"status": "requires_confirmation"
}
```

| Campo          | Tipo   | Descripción                                             |
| -------------- | ------ | ------------------------------------------------------- |
| `externalId`   | string | ID del PaymentIntent en Stripe                          |
| `clientSecret` | string | Secret para Stripe Elements (`stripe.confirmPayment()`) |
| `status`       | string | Estado inicial del PaymentIntent                        |

> **Flujo posterior**: El frontend usa `clientSecret` con Stripe.js para confirmar el pago. Stripe envía el resultado vía webhook a `POST /payments/webhooks/stripe`, que actualiza el payment automáticamente.

---

### Crear pago

```
POST /payments
```

Crea un payment en estado `PENDING` **sin interactuar con Stripe**. Útil para métodos de pago que no requieren autorización inmediata.

**Request body:** Mismo formato que `POST /payments/authorize`

**Response:** `200 OK` (sin body)

---

### Obtener payment por ID

```
GET /payments/:id
```

**Response:**

```json
{
	"id": "uuid",
	"orderId": "uuid",
	"amount": 5000,
	"currency": "EUR",
	"errorMessage": null,
	"externalId": "pi_3ABC123DEF456",
	"metadata": {},
	"paymentMethod": "CARD",
	"retries": 0,
	"status": "ON_HOLD",
	"createdAt": "2026-07-15T21:10:00.000Z",
	"updatedAt": "2026-07-15T21:10:05.000Z"
}
```

---

### Buscar payments

```
GET /payments
```

**Query params:**

| Param        | Tipo                | Descripción                      |
| ------------ | ------------------- | -------------------------------- |
| `id`         | UUID                | Filtrar por ID                   |
| `externalId` | string              | Filtrar por ID de Stripe         |
| `orderId`    | UUID                | Filtrar por order                |
| `status`     | PaymentStatusEnum[] | Filtrar por estado(s)            |
| `retries`    | number              | Filtrar por número de reintentos |
| `skip`       | number              | Offset de paginación             |
| `limit`      | number              | Límite de resultados             |
| `sort`       | string              | Campo de ordenación              |
| `order`      | `ASC` \| `DESC`     | Dirección                        |
| `operator`   | `AND` \| `OR`       | Operador lógico                  |

---

## Availability

### Buscar disponibilidad

```
GET /availability-options
```

Consulta la disponibilidad de slots para actividades. Devuelve proyecciones con tickets y addons.

**Query params:**

| Param        | Tipo            | Descripción                            |
| ------------ | --------------- | -------------------------------------- |
| `optionId`   | UUID            | Filtrar por opción de actividad        |
| `activityId` | UUID            | Filtrar por actividad                  |
| `sort`       | `dateTime`      | Campo de ordenación (único disponible) |
| `order`      | `ASC` \| `DESC` | Dirección                              |
| `skip`       | number          | Offset de paginación                   |
| `limit`      | number          | Límite de resultados                   |
| `operator`   | `AND` \| `OR`   | Operador lógico                        |

**Response:**

```json
{
	"data": [
		{
			"id": "uuid",
			"activityId": "uuid",
			"optionId": "uuid",
			"dateTime": "2026-07-15T21:00:00.000Z",
			"availability": 40,
			"reservedAvailability": 12,
			"tickets": [
				{
					"id": "uuid",
					"price": 2500,
					"stock": 25,
					"reservedStock": 8
				},
				{
					"id": "uuid",
					"price": 1200,
					"stock": 10,
					"reservedStock": 3
				}
			],
			"addons": [
				{
					"id": "uuid",
					"addonId": "uuid",
					"individualTicketId": "uuid",
					"price": 850,
					"stock": 20
				}
			],
			"createdAt": "2026-06-01T10:30:00.000Z",
			"updatedAt": "2026-07-10T14:22:35.000Z"
		}
	],
	"total": 1
}
```

> Ver [documento de disponibilidad](./03-availability.md) para entender cómo calcular plazas disponibles.
