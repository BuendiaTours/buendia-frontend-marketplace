# Autenticación de usuario en SvelteKit (marketplace)

## 1. El login

POST a la API → la API devuelve `{ token, user: { id, name, email, ... } }`

---

## 2. Dónde guardar el token

| Opción                            | Pros                                             | Contras                            |
| --------------------------------- | ------------------------------------------------ | ---------------------------------- |
| **Cookie HttpOnly** (recomendado) | Seguro, invisible para JS del browser (anti-XSS) | Requiere gestión server-side       |
| **localStorage**                  | Simple de implementar                            | Menos seguro, no disponible en SSR |

---

## 3. Quién setea la cookie

**SvelteKit**, no el browser ni la API externa.

```
Browser → POST /login (action en +page.server.ts)
       → SvelteKit llama a la API externa
       → API devuelve { token, user } en el body JSON
       → SvelteKit hace: event.cookies.set('session', token, { httpOnly: true })
       → Browser guarda la cookie (pero JS no puede leerla)
```

---

## 4. `hooks.server.ts` — middleware en cada request

Se ejecuta en **cada request**, pero es barato porque la API normalmente devuelve un **JWT**
(token que lleva los datos del usuario dentro, firmado criptográficamente).

No hay llamada a red: solo se decodifica localmente.

```ts
// src/hooks.server.ts
import { jwtDecode } from 'jwt-decode';

export const handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session');
	if (token) {
		event.locals.user = jwtDecode(token); // operación local, sin red
	}
	return resolve(event);
};
```

---

## 5. Exponer el usuario al marketplace

En `src/routes/(marketplace)/+layout.server.ts`:

```ts
export const load = ({ locals }) => {
	return { user: locals.user ?? null };
};
```

En cualquier componente del marketplace:

```ts
import { page } from '$app/state';
const userId = $page.data.user?.id;
```

---

## 6. ¿Por qué ejecutarlo en cada request si el usuario solo navega?

Aunque el usuario solo esté viendo productos, casi siempre hay UI que depende de si hay sesión:

- Header: "Login" vs "Hola Carlos"
- Icono del carrito con número de items
- Si una actividad ya está en favoritos

El layout del marketplace carga el usuario **una sola vez por request de página**,
no una vez por componente.

---

## Resumen

- Token como **JWT** → decodificación local, sin coste de red
- Cookie **HttpOnly** → segura, el browser la envía automáticamente
- `hooks.server.ts` → decodifica el JWT y popula `event.locals.user`
- `+layout.server.ts` → expone el user a todo `/(marketplace)/` via `$page.data.user`
- Para el carrito: `$page.data.user.id` disponible en cualquier componente
