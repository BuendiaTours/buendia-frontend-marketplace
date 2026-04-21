# Checkout — Validaciones, Questions, Passengers y Errores

## Índice

- [Questions (Preguntas)](#questions-preguntas)
- [Passengers](#passengers)
- [Validaciones del carrito](#validaciones-del-carrito)
- [Validación de respuestas (data types)](#validación-de-respuestas-data-types)
- [Restricciones por estado de la order](#restricciones-por-estado-de-la-order)
- [Códigos de error](#códigos-de-error)

---

## Questions (Preguntas)

Las preguntas se definen en el **catálogo** y se aplican durante el checkout. Cada pregunta tiene un **target** que determina a qué nivel se responde.

### Targets de preguntas

| Target          | Nivel            | Dónde se envían las respuestas                     | Cuándo                           |
| --------------- | ---------------- | -------------------------------------------------- | -------------------------------- |
| `BOOKING`       | Booking completo | `PATCH /bookings/:id` → `bookingAnswers`           | Al actualizar el booking         |
| `PASSENGER`     | Cada passenger   | `PATCH /bookings/:bid/passengers/:pid` → `answers` | Al actualizar cada passenger     |
| `EXTRA`         | Cada addon       | `PATCH /bookings/:id` → `addons[].answers`         | Al actualizar addons del booking |
| `PICKUP_POINT`  | Pickup point     | `PATCH /bookings/:id` → `pickupPoint.answers`      | Al seleccionar pickup point      |
| `DROPOFF_POINT` | Dropoff point    | `PATCH /bookings/:id` → `dropoffPoint.answers`     | Al seleccionar dropoff point     |

### Estructura de una respuesta (Answer)

```json
{
	"questionId": "uuid-de-la-pregunta-del-catalogo",
	"values": ["valor1", "valor2"]
}
```

- `questionId` referencia la pregunta del catálogo.
- `values` es siempre un array de strings, incluso para respuestas simples (`["Juan"]`).
- El campo `description` (label de la pregunta) lo genera el **servidor** automáticamente — el frontend solo envía `questionId` + `values`.

### Data types de preguntas

El catálogo define el tipo de dato esperado para cada pregunta. El backend valida que los `values` cumplan el formato.

| Data Type          | Formato esperado                   | Ejemplo                        |
| ------------------ | ---------------------------------- | ------------------------------ |
| `INPUT_TEXT`       | Texto no vacío                     | `["Juan García"]`              |
| `TEXT_AREA`        | Texto no vacío                     | `["Special dietary needs..."]` |
| `EMAIL`            | Email válido                       | `["user@email.com"]`           |
| `PHONE`            | +dígitos (7-20 chars)              | `["+34612345678"]`             |
| `DATE`             | YYYY-MM-DD                         | `["1990-05-15"]`               |
| `BIRTHDAY`         | YYYY-MM-DD                         | `["1990-05-15"]`               |
| `DATE_AND_TIME`    | YYYY-MM-DDTHH:MM                   | `["2026-07-15T21:00"]`         |
| `INPUT_NUMBER`     | Número                             | `["42"]`                       |
| `AGE`              | Número                             | `["35"]`                       |
| `CHECKBOX`         | `"true"` o `"false"`               | `["true"]`                     |
| `BOOLEAN`          | `"true"` o `"false"`               | `["false"]`                    |
| `CHECK_TERMS`      | `"true"` o `"false"`               | `["true"]`                     |
| `OPTION`           | Un valor de las opciones definidas | `["M"]`                        |
| `RADIO_BUTTON`     | Un valor de las opciones definidas | `["vegetarian"]`               |
| `MULTI_OPTION`     | Uno o más valores de las opciones  | `["en", "es"]`                 |
| `COUNTRY`          | Texto no vacío (ISO code)          | `["ES"]`                       |
| `LANGUAGE`         | Texto no vacío                     | `["Spanish"]`                  |
| `GENDER`           | Texto no vacío                     | `["Male"]`                     |
| `PASSPORT`         | Texto no vacío                     | `["AB1234567"]`                |
| `PASSPORT_EXPIRED` | Texto no vacío (fecha expiración)  | `["2030-12-31"]`               |

> **Error si no cumple el formato:** `BOOKING_ANSWER_INVALID_DATA_TYPE`

### Preguntas con opciones

Para preguntas de tipo `OPTION`, `MULTI_OPTION` o `RADIO_BUTTON`, el catálogo define las opciones válidas:

```json
{
	"questionId": "uuid",
	"dataType": "OPTION",
	"options": [
		{ "id": "uuid", "label": "Talla S", "value": "S" },
		{ "id": "uuid", "label": "Talla M", "value": "M" },
		{ "id": "uuid", "label": "Talla L", "value": "L" }
	]
}
```

El `values` de la respuesta debe contener solo valores del campo `value` de las opciones.

### Preguntas filtradas por grupo de edad

Algunas preguntas de passenger solo aplican a ciertos grupos de edad (ej: "Fecha de nacimiento" solo para niños). El catálogo define `groupAge` como filtro. El backend valida automáticamente qué preguntas aplican a cada passenger según su `group` (derivado del `individualTicketId`).

---

## Passengers

### Estructura de un passenger

Al **crear** un passenger (POST /orders o POST /bookings/:id/passengers), el frontend solo envía:

```json
{
	"id": "uuid-generado-por-el-cliente",
	"individualTicketId": "uuid-del-tipo-de-ticket"
}
```

El servidor enriquece automáticamente:

- `group` — Categoría del ticket (ej: "ADULT", "CHILD", "SENIOR")
- `priceAtBooking` — Precio al momento de la reserva (en céntimos)
- `unitCommission` — Comisión por unidad (en céntimos)
- `isMainPax` — `false` por defecto
- `answers` — Vacío inicialmente

### Actualizar datos del passenger

Una vez creado, se actualizan los datos del passenger con:

```
PATCH /bookings/:bookingId/passengers/:passengerId
```

```json
{
	"answers": [
		{ "questionId": "uuid-first-name", "values": ["Juan"] },
		{ "questionId": "uuid-last-name", "values": ["García"] },
		{ "questionId": "uuid-birthdate", "values": ["1990-05-15"] },
		{ "questionId": "uuid-passport", "values": ["AB1234567"] }
	],
	"isMainPax": true
}
```

> **Nota importante**: El nombre y apellido del passenger se almacenan como **answers** con `questionId` reservados, no como campos explícitos del passenger.

### Flag `isMainPax`

Marca al passenger principal del booking. Es responsabilidad del frontend garantizar que un passenger por booking sea `isMainPax: true`. El backend no lo valida automáticamente.

### Restricciones de operaciones por estado

| Operación                    | CART | CHECKING_OUT | PENDING_PAYMENT+ |
| ---------------------------- | ---- | ------------ | ---------------- |
| Añadir passenger             | ✅   | ✅           | ❌               |
| Eliminar passenger           | ✅   | ✅           | ❌               |
| Actualizar answers/isMainPax | ✅   | ✅           | ❌               |

---

## Validaciones del carrito

El endpoint `GET /orders/:id/validation` y el paso de reserva (`POST /orders/:id/reserve`) ejecutan la misma validación completa. La diferencia es que `/validation` es solo lectura y `/reserve` cambia el estado si la validación pasa.

### Lista completa de validaciones

#### 1. Estructura básica

| Validación                       | Descripción                                                      |
| -------------------------------- | ---------------------------------------------------------------- |
| Al menos 1 booking               | La order debe tener al menos un booking                          |
| Al menos 1 passenger por booking | Cada booking debe tener al menos un passenger                    |
| Datos de contacto completos      | `contactEmail`, `contactFirstName`, `contactLastName` requeridos |

#### 2. Disponibilidad y stock

| Validación                 | Issue type                           | Descripción                                                           |
| -------------------------- | ------------------------------------ | --------------------------------------------------------------------- |
| Disponibilidad del slot    | `NO_AVAILABILITY`                    | `availability - reservedAvailability >= total passengers del booking` |
| Stock por tipo de ticket   | `NO_TICKET_STOCK`                    | `stock - reservedStock >= passengers con ese individualTicketId`      |
| Máximo tickets por persona | `EXCEEDS_MAX_TICKETS_PER_INDIVIDUAL` | No exceder el límite configurado en la opción de actividad            |

#### 3. Pickup y dropoff

| Validación              | Issue type              | Descripción                                                        |
| ----------------------- | ----------------------- | ------------------------------------------------------------------ |
| Pickup point requerido  | `MISSING_PICKUP_POINT`  | Si la opción de actividad requiere pickup, debe estar seleccionado |
| Dropoff point requerido | `MISSING_DROPOFF_POINT` | Si la opción requiere dropoff, debe estar seleccionado             |

#### 4. Questions obligatorias

| Validación              | Issue type                     | Descripción                                                                                                          |
| ----------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Booking questions       | `MISSING_BOOKING_ANSWER`       | Todas las preguntas `required` con target `BOOKING` deben tener respuesta                                            |
| Passenger questions     | `MISSING_PASSENGER_ANSWER`     | Todas las preguntas `required` con target `PASSENGER` deben tener respuesta (filtradas por `groupAge` del passenger) |
| Addon questions         | `MISSING_ADDON_ANSWER`         | Preguntas `required` con target `EXTRA` deben tener respuesta si hay addons                                          |
| Pickup point questions  | `MISSING_PICKUP_POINT_ANSWER`  | Preguntas `required` del pickup point deben tener respuesta                                                          |
| Dropoff point questions | `MISSING_DROPOFF_POINT_ANSWER` | Preguntas `required` del dropoff point deben tener respuesta                                                         |

> Una respuesta se considera **válida** si tiene `questionId` y al menos un valor no vacío en `values`.

---

## Validación de respuestas (data types)

Esta validación se ejecuta al **crear un booking** (no al actualizar). Verifica que cada answer cumpla el formato esperado por su `dataType` del catálogo.

**Cuándo se ejecuta:** `POST /orders` y `POST /orders/:id/bookings`

**Error:** `BOOKING_ANSWER_INVALID_DATA_TYPE`

Ver la tabla de data types en la sección [Questions](#data-types-de-preguntas) para los formatos esperados.

---

## Restricciones por estado de la order

### Operaciones sobre bookings

| Operación                                           | CART | CHECKING_OUT | PENDING_PAYMENT+ |
| --------------------------------------------------- | ---- | ------------ | ---------------- |
| Crear booking                                       | ✅   | ❌           | ❌               |
| Eliminar booking                                    | ✅   | ❌           | ❌               |
| Actualizar booking (addons, answers, pickup, hotel) | ✅   | ✅           | ❌               |

### Operaciones sobre orders

| Operación           | CART | CHECKING_OUT | PENDING_PAYMENT | CONFIRMED+ |
| ------------------- | ---- | ------------ | --------------- | ---------- |
| Actualizar contacto | ✅   | ✅           | ❌              | ❌         |
| Iniciar checkout    | ✅   | ❌           | ❌              | ❌         |
| Validar carrito     | ✅   | ✅           | ❌              | ❌         |
| Reservar            | ❌   | ✅           | ❌              | ❌         |
| Autorizar pago      | ❌   | ❌           | ✅              | ❌         |

---

## Códigos de error

### Order

| Código                            | HTTP | Causa                                              |
| --------------------------------- | ---- | -------------------------------------------------- |
| `ORDER_NOT_FOUND`                 | 404  | Order no existe                                    |
| `ORDER_ALREADY_EXISTS`            | 409  | ID de order duplicado                              |
| `ORDER_INVALID_STATUS_TRANSITION` | 422  | Transición de estado no permitida                  |
| `ORDER_INCOMPLETE_CART`           | 422  | Carrito incompleto (faltan datos, preguntas, etc.) |
| `ORDER_NO_AVAILABILITY`           | 422  | No hay disponibilidad en algún slot                |
| `ORDER_NO_TICKET_STOCK`           | 422  | Stock insuficiente para algún ticket               |

### Booking

| Código                                           | HTTP | Causa                                         |
| ------------------------------------------------ | ---- | --------------------------------------------- |
| `BOOKING_NOT_FOUND`                              | 404  | Booking no existe                             |
| `BOOKING_ALREADY_EXISTS`                         | 409  | ID de booking duplicado                       |
| `BOOKING_INVALID_STATUS_TRANSITION`              | 422  | Transición de estado no permitida             |
| `BOOKING_REQUIRES_AT_LEAST_ONE_PASSENGER`        | 422  | Intento de eliminar el último passenger       |
| `BOOKING_PASSENGER_NOT_FOUND`                    | 404  | Passenger no existe en este booking           |
| `BOOKING_ORDER_NOT_IN_CART`                      | 422  | La order no está en CART (para crear booking) |
| `BOOKING_ORDER_NOT_IN_CART_OR_CHECKING_OUT`      | 422  | La order no está en CART ni CHECKING_OUT      |
| `BOOKING_ORDER_NOT_CHECKING_OUT`                 | 422  | La order no está en CHECKING_OUT              |
| `BOOKING_ANSWER_INVALID_DATA_TYPE`               | 422  | Una respuesta no cumple el formato esperado   |
| `BOOKING_OPTION_NOT_FOUND_IN_CATALOG`            | 404  | La opción no existe en el catálogo            |
| `BOOKING_INDIVIDUAL_TICKET_NOT_FOUND_IN_CATALOG` | 404  | El tipo de ticket no existe en el catálogo    |
| `BOOKING_PICKUP_POINT_NOT_FOUND_IN_CATALOG`      | 404  | El pickup point no existe en el catálogo      |
| `BOOKING_HOTEL_NOT_FOUND_IN_CATALOG`             | 404  | El hotel no existe en el catálogo             |
| `BOOKING_ADDON_NOT_FOUND_IN_CATALOG`             | 404  | El addon no existe en el catálogo             |
| `BOOKING_QUESTION_NOT_FOUND_IN_CATALOG`          | 404  | La pregunta no existe en el catálogo          |

### Payment

| Código                         | HTTP | Causa                                |
| ------------------------------ | ---- | ------------------------------------ |
| `PAYMENT_NOT_FOUND`            | 404  | Payment no existe                    |
| `PAYMENT_ALREADY_EXISTS`       | 409  | ID de payment duplicado              |
| `PAYMENT_ORDER_ALREADY_EXISTS` | 409  | Ya existe un payment para esta order |
| `PAYMENT_ORDER_NOT_FOUND`      | 404  | La order asociada no existe          |
| `PAYMENT_AUTHORIZATION_FAILED` | 422  | Stripe rechazó la autorización       |

---

## Flujo recomendado para el frontend

```
1. Consultar disponibilidad
   GET /availability-options?optionId=...&sort=dateTime&order=ASC
   → Mostrar slots disponibles con plazas y precios

2. Crear order con primer booking
   POST /orders { id, userId, booking: { id, optionId, activityDatetime, passengers } }
   → El servidor devuelve 200 si todo ok

3. (Opcional) Añadir más bookings o passengers
   POST /orders/:id/bookings
   POST /bookings/:id/passengers

4. Completar datos del booking
   PATCH /bookings/:id { addons, bookingAnswers, pickupPoint, dropoffPoint, hotel }

5. Completar datos de cada passenger
   PATCH /bookings/:bid/passengers/:pid { answers, isMainPax }

6. Rellenar datos de contacto
   PATCH /orders/:id { contactEmail, contactFirstName, contactLastName, contactPhone, ... }

7. Validar carrito (opcional pero recomendado)
   GET /orders/:id/validation
   → Si isComplete=false, mostrar issues al usuario

8. Iniciar checkout
   POST /orders/:id/checkout
   → Order pasa a CHECKING_OUT

9. (Si quedan preguntas pendientes) Completar
   PATCH /bookings/:bid/passengers/:pid { answers }

10. Reservar
    POST /orders/:id/reserve
    → Validación completa + cálculo de totales
    → Order pasa a PENDING_PAYMENT

11. Autorizar pago
    POST /payments/authorize { orderId, amount, paymentMethod }
    → Recibir { clientSecret }

12. Confirmar pago con Stripe Elements
    stripe.confirmPayment({ clientSecret, ... })
    → Stripe envía webhook automáticamente
    → Payment pasa a ON_HOLD → Order pasa a CONFIRMED

13. Polling o websocket para estado final
    GET /orders/:id  → status: COMPLETED / PARTIALLY_COMPLETED / FAILED
    GET /bookings?orderId=...  → ver estado individual de cada booking
```
