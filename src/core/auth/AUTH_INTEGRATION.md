# Integración de Autenticación — Backend API

Este documento describe el sistema de autenticación y autorización del backend para que el frontend pueda integrarse correctamente.

## Arquitectura general

- **Proveedor de identidad**: AWS Cognito (email/password + OAuth social con Google)
- **Tokens**: JWT emitidos por Cognito, validados por el backend
- **Modelo de usuarios**: Dos tipos (`kind`): `CLIENT` (marketplace) y `ADMIN` (backoffice)
- **Roles** (solo para ADMIN): `SUPPLY`, `CUSTOMER_ATTENDANT`, `FINANCES`, `CONTENT`

## Flujo de autenticación

### 1. Login con email/password

```
POST /auth/login
Body: { provider: "COGNITO", email: "user@example.com", password: "..." }

Response 200:
{
  accessToken: "eyJ...",
  refreshToken: "eyJ...",
  expiresIn: 3600,
  user: { id, email, name, kind, roles }
}
```

### 2. Login con Google (OAuth)

El flujo OAuth requiere dos pasos para protección CSRF:

```
1. GET /auth/oauth-state → { state: "random-token" }
   (Almacenar el state en sessionStorage o cookie)

2. Redirigir al usuario a la URL de OAuth de Cognito con el state

3. Cognito redirige de vuelta con ?code=xxx&state=yyy

4. GET /auth/callback?code=xxx&state=yyy → AuthLoginResponse
   (El backend valida el state contra Redis)
```

### 3. Registro

```
POST /auth/register
Body: {
  authIdentityId: "uuid",   // UUID generado por el frontend
  userId: "uuid",            // UUID generado por el frontend
  provider: "COGNITO",
  email: "user@example.com",
  password: "...",
  name: "John Doe",
  phone: "+34600000000",     // opcional
  kind: "CLIENT"             // opcional, default CLIENT
}

Response 200:
{ authIdentityId, userId, provider, externalUserId }
```

Tras el registro con email/password, el usuario debe confirmar su cuenta:

```
POST /auth/confirm
Body: { email: "user@example.com", code: "123456" }
```

Si el código expira:

```
POST /auth/resend-code
Body: { email: "user@example.com" }
```

### 4. Refresh token

```
POST /auth/refresh-token
Body: { refreshToken: "eyJ..." }

Response 200: AuthLoginResponse (nuevo accessToken + refreshToken)
```

### 5. Logout

```
POST /auth/logout
Headers: { Authorization: "Bearer <accessToken>" }
```

El backend añade el token a una blacklist en Redis. Cualquier petición posterior con ese token recibirá 401.

## Autorización — Headers requeridos

**Todas las rutas** (excepto las públicas) requieren:

```
Authorization: Bearer <accessToken>
```

Si el token es inválido, expirado o está en la blacklist → **401 Unauthorized**.

## Guardas del backend

El backend aplica tres niveles de protección que el frontend debe tener en cuenta:

### 1. AuthGuard (global en `/auth`, activo en todos los controllers)

- Valida el JWT del header `Authorization: Bearer <token>`
- Endpoints marcados con `@Public()` son accesibles sin token
- **Endpoints públicos**: `/auth/login`, `/auth/register`, `/auth/refresh-token`, `/auth/confirm`, `/auth/resend-code`, `/auth/validate`, `/auth/oauth-state`, `/auth/callback`
- **Endpoints protegidos**: todos los demás (`/auth/logout`, `/auth/me`, `/auth/change-password`, `/auth/link-provider`, `/auth/unlink-provider`, y **todos los endpoints de recursos**: `/users/*`, `/activities/*`, `/suppliers/*`, etc.)

### 2. KindGuard — Restricción por tipo de usuario

Algunas rutas están restringidas a un `kind` específico:

- `@AdminOnly()` → solo usuarios con `kind: "ADMIN"`
- `@ClientOnly()` → solo usuarios con `kind: "CLIENT"`

Si el usuario no tiene el kind correcto → **403 Forbidden** con mensaje `"Access denied. Required user kind: ADMIN"`.

**Implicación para el frontend**: El sidebar/navegación debe mostrar solo las secciones accesibles según el `kind` del usuario. Si el usuario es CLIENT, no debe ver rutas de backoffice. El campo `kind` está disponible en `user` del login response y en `GET /auth/me`.

### 3. RolesGuard — Restricción por rol (solo ADMIN)

Algunas rutas de backoffice están restringidas a roles específicos:

- `@Roles(UserRole.SUPPLY)` → solo admins con rol SUPPLY
- `@Roles(UserRole.FINANCES, UserRole.SUPPLY)` → admins con CUALQUIERA de esos roles

Si el usuario no tiene ninguno de los roles requeridos → **403 Forbidden** con mensaje `"Access denied. Required roles: SUPPLY, FINANCES"`.

**Implicación para el frontend**: Los roles están disponibles en `user.roles[]` del login response y en `GET /auth/me`. Usar este array para:

- Mostrar/ocultar secciones del menú
- Habilitar/deshabilitar acciones en la UI
- Redirigir a una página de "sin permisos" si el usuario navega a una ruta no autorizada

## Obtener usuario actual

```
GET /auth/me
Headers: { Authorization: "Bearer <accessToken>" }

Response 200:
{
  id: "uuid",
  email: "user@example.com",
  name: "John Doe",
  kind: "ADMIN",
  roles: ["SUPPLY", "CONTENT"],
  linkedProviders: ["COGNITO", "GOOGLE"]
}
```

Usar este endpoint al cargar la app para obtener el perfil completo del usuario autenticado.

## Validar token (sin autenticación)

```
GET /auth/validate
Headers: { Authorization: "Bearer <accessToken>" }

Response 200:
{ valid: true, expiresIn: 2847, userId: "uuid" }
```

Endpoint público — útil para verificar si un token sigue siendo válido sin forzar un 401.

## Cambio de contraseña

```
PATCH /auth/change-password
Headers: { Authorization: "Bearer <accessToken>" }
Body: { oldPassword: "...", newPassword: "..." }
```

Requisitos del `newPassword`:

- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número
- Al menos un carácter especial

## Gestión de proveedores

### Vincular proveedor externo (Google)

```
POST /auth/link-provider
Headers: { Authorization: "Bearer <accessToken>" }
Body: { provider: "GOOGLE", token: "<google-id-token>" }
```

### Desvincular proveedor

```
DELETE /auth/unlink-provider
Headers: { Authorization: "Bearer <accessToken>" }
Body: { provider: "GOOGLE" }
```

## Rate limiting

Los endpoints de auth tienen throttling específico:

- **Auth endpoints** (`login`, `register`, `confirm`, `resend-code`, `oauth-state`, `callback`): límite agresivo para prevenir brute force
- **Refresh token**: límite separado, más permisivo

Si se supera el límite → **429 Too Many Requests**.

## Resumen de errores HTTP

| Código | Significado                         | Acción del frontend                                                |
| ------ | ----------------------------------- | ------------------------------------------------------------------ |
| 401    | Token inválido, expirado o revocado | Redirigir a login. Intentar refresh token antes si está disponible |
| 403    | Kind o roles insuficientes          | Mostrar página de "sin permisos" o redirigir                       |
| 429    | Rate limit excedido                 | Mostrar mensaje de "demasiados intentos, espere"                   |

## Flujo recomendado para SvelteKit

1. **Login**: Llamar `AUTH_REQUEST.login()`, almacenar tokens en cookies httpOnly (server-side) o en un store.
2. **Cada petición**: Incluir `Authorization: Bearer <accessToken>` via el `fetch` de SvelteKit (hooks).
3. **Refresh**: Si una petición devuelve 401, intentar `AUTH_REQUEST.refreshToken()` automáticamente. Si falla, redirigir a login.
4. **Carga inicial**: En el layout root, llamar `AUTH_REQUEST.me()` para hidratar el store de usuario con kind, roles y linkedProviders.
5. **Guardas client-side**: En `+layout.ts` o `+page.ts`, verificar `kind` y `roles` del store antes de renderizar. Esto es UX — la protección real está en el backend.
