# Checkout — Visión General

## Arquitectura

El checkout se compone de **tres módulos** dentro del bounded context `checkout/`:

| Módulo      | Responsabilidad                                                    | Base de datos                            |
| ----------- | ------------------------------------------------------------------ | ---------------------------------------- |
| **Order**   | Carrito, datos de contacto, totales, ciclo de vida del pedido      | Postgres (escritura) + MongoDB (lectura) |
| **Booking** | Reservas individuales por actividad, passengers, questions, addons | Postgres (escritura) + MongoDB (lectura) |
| **Payment** | Procesamiento de pagos (Stripe), autorización, captura, reembolsos | Postgres (escritura) + MongoDB (lectura) |

Adicionalmente, el módulo **Availability** (bounded context `availability/`) gestiona la disponibilidad de slots y stock de tickets.

---

## Flujo completo del checkout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FASE 1: CARRITO                                │
│                                                                         │
│  1. Crear Order (POST /orders)                                         │
│     → Se crea la order en estado CART con un primer booking             │
│     → El booking incluye al menos 1 passenger con su individualTicketId │
│                                                                         │
│  2. (Opcional) Añadir más bookings (POST /orders/:id/bookings)         │
│     → Cada booking es una actividad/fecha diferente                     │
│                                                                         │
│  3. Editar bookings y passengers:                                       │
│     → Añadir passengers    (POST   /bookings/:id/passengers)           │
│     → Eliminar passengers  (DELETE /bookings/:bookingId/passengers/:id)│
│     → Actualizar booking   (PATCH  /bookings/:id)                      │
│       - addons, answers, pickup/dropoff point, hotel                    │
│     → Eliminar booking     (DELETE /bookings/:id)                      │
│                                                                         │
│  4. Rellenar datos de contacto (PATCH /orders/:id)                     │
│     → contactEmail, contactFirstName, contactLastName,                  │
│       contactPhone, contactNationalityCountryCode                       │
│                                                                         │
│  ⚠️ Los totales se recalculan automáticamente cada vez que se          │
│     añaden/eliminan bookings o passengers.                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     FASE 2: INICIO DEL CHECKOUT                         │
│                                                                         │
│  5. Validar carrito (GET /orders/:id/validation)                       │
│     → Devuelve { isComplete, issues[], reasons[] }                      │
│     → NO cambia estado, es solo lectura                                 │
│                                                                         │
│  6. Iniciar checkout (POST /orders/:id/checkout)                       │
│     → Order pasa a CHECKING_OUT                                         │
│     → Se bloquean: crear/eliminar bookings y passengers                 │
│     → Se permite: actualizar passengers (answers, isMainPax)            │
│                                                                         │
│  7. (Opcional) Actualizar passengers con answers pendientes             │
│     → PATCH /bookings/:bookingId/passengers/:passengerId               │
│     → Solo permitido en estado CHECKING_OUT                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       FASE 3: RESERVA Y PAGO                            │
│                                                                         │
│  8. Reservar (POST /orders/:id/reserve)                                │
│     → Ejecuta validación completa del carrito                           │
│     → Calcula totales definitivos                                       │
│     → Order pasa a PENDING_PAYMENT                                      │
│                                                                         │
│  9. Autorizar pago (POST /payments/authorize)                          │
│     → Crea PaymentIntent en Stripe                                      │
│     → Devuelve { externalId, clientSecret, status }                     │
│     → El frontend usa clientSecret con Stripe Elements                  │
│                                                                         │
│  10. Stripe confirma el pago (webhook automático)                       │
│     → POST /payments/webhooks/stripe                                    │
│     → Payment pasa a ON_HOLD                                            │
│     → Order pasa automáticamente a CONFIRMED                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    FASE 4: CONFIRMACIÓN EXTERNA                         │
│                                                                         │
│  11. El sistema de reservas externo procesa cada booking (async)        │
│      → RabbitMQ: bs.booking.checkout.confirmed                          │
│        → Booking pasa a CONFIRMED (con externalBookingId)               │
│      → RabbitMQ: bs.booking.checkout.retrying                           │
│        → Booking pasa a RETRYING (error temporal)                       │
│      → RabbitMQ: bs.booking.checkout.failed                             │
│        → Booking pasa a FAILED (error permanente)                       │
│                                                                         │
│  12. Resolución final de la Order:                                      │
│      → Todos los bookings CONFIRMED → Order COMPLETED                   │
│      → Algunos CONFIRMED, otros FAILED → Order PARTIALLY_COMPLETED      │
│      → Todos FAILED → Order FAILED                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Diagrama de estados

### Order

```
CART ──────► CHECKING_OUT ──────► PENDING_PAYMENT ──────► CONFIRMED ──┬──► COMPLETED
  │               │                      │                            ├──► PARTIALLY_COMPLETED
  │               │                      │                            └──► FAILED
  ▼               ▼                      ▼
EXPIRED        EXPIRED               EXPIRED
```

| Estado                | Descripción                                       | Acciones permitidas                                                                  |
| --------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `CART`                | Carrito abierto, editable                         | Crear/eliminar bookings, añadir/eliminar passengers, editar contacto, editar booking |
| `CHECKING_OUT`        | Checkout iniciado                                 | Actualizar passenger answers/isMainPax, validar, reservar                            |
| `PENDING_PAYMENT`     | Esperando pago                                    | Autorizar pago                                                                       |
| `CONFIRMED`           | Pago recibido, esperando confirmación de reservas | Solo lectura (el backend procesa)                                                    |
| `COMPLETED`           | Todos los bookings confirmados                    | Solo lectura                                                                         |
| `PARTIALLY_COMPLETED` | Algunos bookings fallaron                         | Solo lectura                                                                         |
| `FAILED`              | Todos los bookings fallaron                       | Solo lectura                                                                         |
| `EXPIRED`             | Tiempo de checkout agotado                        | Solo lectura                                                                         |

> **Expiración**: La order tiene un campo `expiresAt` (por defecto 20 minutos desde la creación). Un cron job ejecuta `POST /orders/expire-orders` periódicamente para expirar orders cuyo tiempo ha pasado.

### Booking

```
PENDING ──┬──► CONFIRMED
          ├──► RETRYING ──┬──► CONFIRMED
          ├──► FAILED     └──► FAILED
          ├──► CANCELLED
          └──► EXPIRED

CONFIRMED ──┬──► CANCELLED
            └──► CANCELLATION_FAILED
```

| Estado                | Descripción                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------- |
| `PENDING`             | Booking creado, esperando procesamiento                                                      |
| `CONFIRMED`           | Reserva confirmada por el sistema externo (incluye `confirmationCode` y `externalBookingId`) |
| `RETRYING`            | Error temporal del sistema externo, reintentando (incluye `lastError`)                       |
| `FAILED`              | Error permanente del sistema externo (incluye `lastError`)                                   |
| `CANCELLED`           | Cancelación confirmada                                                                       |
| `CANCELLATION_FAILED` | La cancelación falló en el sistema externo                                                   |
| `EXPIRED`             | La order padre expiró                                                                        |

### Payment

```
PENDING ──┬──► ON_HOLD ──┬──► COMPLETED ──► REFUNDED
          │              └──► CANCELLED
          └──► FAILED ──► PENDING (retry)
                     └──► CANCELLED
```

| Estado      | Descripción                                               |
| ----------- | --------------------------------------------------------- |
| `PENDING`   | Pago creado, pendiente de autorización                    |
| `ON_HOLD`   | Fondos retenidos por Stripe (dispara `Order → CONFIRMED`) |
| `COMPLETED` | Fondos capturados                                         |
| `FAILED`    | Autorización rechazada (incluye `errorMessage`)           |
| `REFUNDED`  | Reembolso procesado                                       |
| `CANCELLED` | Pago cancelado                                            |

---

## IDs generados por el cliente vs servidor

| Campo                        | Generado por       | Notas                                                   |
| ---------------------------- | ------------------ | ------------------------------------------------------- |
| `order.id`                   | **Cliente** (UUID) | Enviado en POST /orders                                 |
| `booking.id`                 | **Cliente** (UUID) | Enviado en POST /orders o POST /orders/:id/bookings     |
| `passenger.id`               | **Cliente** (UUID) | Enviado con cada passenger                              |
| `order.legibleId`            | **Servidor**       | Referencia legible autogenerada                         |
| `booking.legibleId`          | **Servidor**       | Referencia legible autogenerada                         |
| `payment.id`                 | **Servidor**       | UUID generado internamente                              |
| `booking.snapshot`           | **Servidor**       | Snapshot de datos del catálogo al momento de crear      |
| Precios (passengers, addons) | **Servidor**       | Resueltos desde el catálogo, no enviados por el cliente |

---

## Moneda y precios

- La **moneda** se establece al crear la order (por defecto `EUR`) y es **inmutable**.
- Todos los precios están en la **unidad más pequeña** de la moneda (céntimos para EUR).
  - Ejemplo: `2500` = 25.00 EUR
- Los totales (`totalAmount`, `totalCommission`) se **recalculan automáticamente** en el servidor cuando cambian los bookings/passengers.
- El `subtotalPrice` y `subtotalCommission` de cada booking se calculan sumando los precios de sus passengers y addons.
