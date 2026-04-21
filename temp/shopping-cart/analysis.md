# Shopping Cart — Análisis y Decisiones de Arquitectura

## Estado del sistema al iniciar esta implementación

El flujo de selección ya existe y funciona:

- `CheckoutState` (`src/lib/stores/checkout.svelte.ts`) — gestiona disponibilidad, fechas y contadores de tickets
- `CheckoutActivityOption.svelte` — UI de selección con slot, precio y botones (sin conectar)
- `Checkout.svelte` — widget de datepicker + contadores

Lo que falta: convertir esa selección en un **carrito persistente** sincronizado con el backend.

---

## Arquitectura del backend (de temp/checkout/)

### Tres módulos

| Módulo      | Responsabilidad                                                  |
| ----------- | ---------------------------------------------------------------- |
| **Order**   | Carrito, datos de contacto, totales, ciclo de vida del pedido    |
| **Booking** | Reserva individual de una actividad (opción + fecha + pasajeros) |
| **Payment** | Integración Stripe, autorización, captura                        |

### IDs — el cliente los genera

```
order.id    → crypto.randomUUID() en frontend
booking.id  → crypto.randomUUID() en frontend
passenger.id → crypto.randomUUID() en frontend
```

### Precio en céntimos

Todos los importes están en la unidad mínima de la moneda: `2500` = 25,00 €

---

## Flujo de datos: del selector al API

```
checkout.counts (SvelteMap<group, qty>)
  + option.individualTickets (group → individualTicketId)
  + slot.dateTime
  ──────────────────────────────────────────────────────
         ↓ cartStore.addActivity()
         ↓
         expandir counts → passengers[]
         { id: uuid, individualTicketId }

Si orderId === null  →  POST /api/orders    (crea order + primer booking)
Si orderId existe    →  POST /api/orders/:id/bookings  (añade booking)

         ↓ éxito
         → loadOrder() para sincronizar estado
         → localStorage.setItem('cart_order_id', orderId)
```

---

## Decisiones tomadas

| Decisión       | Elección                              | Razón                                                             |
| -------------- | ------------------------------------- | ----------------------------------------------------------------- |
| Tipo de store  | Singleton global (no context)         | El carrito es estado de app, no de componente                     |
| Persistencia   | `localStorage` (key: `cart_order_id`) | Survives refresh, cliente sabe qué order recuperar                |
| Autenticación  | Anónimo + autenticado                 | `userId` opcional en el payload                                   |
| Sincronización | Backend es source of truth            | Tras cada mutación se hace GET /orders/:id                        |
| Proxy routes   | Sí (obligatorio)                      | `apiClient` usa `$env/dynamic/private` — no importable en .svelte |

---

## Endpoints usados (fase 1)

| Método   | Ruta proxy frontend        | Ruta API backend            | Propósito                        |
| -------- | -------------------------- | --------------------------- | -------------------------------- |
| `POST`   | `/api/orders`              | `POST /orders`              | Crear order con primer booking   |
| `GET`    | `/api/orders/:id`          | `GET /orders/:id`           | Leer estado del order            |
| `POST`   | `/api/orders/:id/bookings` | `POST /orders/:id/bookings` | Añadir booking a order existente |
| `DELETE` | `/api/bookings/:id`        | `DELETE /bookings/:id`      | Eliminar booking                 |

---

## Estructura del payload `POST /orders`

```json
{
	"id": "uuid-generado-cliente",
	"userId": "uuid-usuario-o-null",
	"booking": {
		"id": "uuid-generado-cliente",
		"optionId": "uuid-option",
		"activityDatetime": "2026-07-15T21:00:00.000Z",
		"passengers": [
			{ "id": "uuid", "individualTicketId": "uuid-ticket-adult" },
			{ "id": "uuid", "individualTicketId": "uuid-ticket-adult" },
			{ "id": "uuid", "individualTicketId": "uuid-ticket-child" }
		]
	}
}
```

---

## Archivos creados/modificados en esta fase

| Acción     | Fichero                                                                 |
| ---------- | ----------------------------------------------------------------------- |
| MODIFICADO | `src/lib/types.ts` — tipos Order, Booking, Passenger, payloads          |
| MODIFICADO | `src/core/_shared/endpoints.config.ts` — orders + bookings              |
| CREADO     | `src/lib/api/marketplace/endpoints/orders.ts`                           |
| MODIFICADO | `src/lib/api/proxy-routes.ts`                                           |
| CREADO     | `src/routes/api/orders/+server.ts`                                      |
| CREADO     | `src/routes/api/orders/[orderId]/+server.ts`                            |
| CREADO     | `src/routes/api/orders/[orderId]/bookings/+server.ts`                   |
| CREADO     | `src/routes/api/bookings/[bookingId]/+server.ts`                        |
| CREADO     | `src/lib/stores/cartStore.svelte.ts`                                    |
| MODIFICADO | `src/lib/components/marketplace/Checkout/CheckoutActivityOption.svelte` |

---

## Verificación

1. Seleccionar fecha + slot + tickets en página de actividad
2. Click "Añadir al carrito" → Network: `POST /api/orders` con payload correcto
3. Verificar `localStorage.cart_order_id` guardado
4. Recargar → `cartStore.orderId` persiste, `loadOrder()` recupera el order
5. Añadir segunda actividad → `POST /api/orders/:id/bookings`
6. `cartStore.bookingCount` incrementa

---

## Fases siguientes (fuera de scope de esta fase)

- **Fase 2**: UI carrito (página/drawer mostrando bookings, opción de eliminar)
- **Fase 3**: Formulario de contacto + validación (`GET /orders/:id/validation`)
- **Fase 4**: Checkout (`POST /orders/:id/checkout` → `POST /orders/:id/reserve`)
- **Fase 5**: Pago con Stripe (`POST /payments/authorize`)
- **Fase 6**: Confirmación + polling de estado final
