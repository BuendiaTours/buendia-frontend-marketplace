# Flujo de Validación de Formularios

Este documento describe el flujo completo de validación de formularios en la aplicación, incluyendo validación del lado del cliente y del servidor, así como el sistema de notificaciones toast.

## Arquitectura General

El sistema de validación utiliza:
- **Sveltekit-superforms**: Para manejo de formularios y validación
- **Zod**: Para schemas de validación
- **Flash Messages**: Para persistir mensajes entre redirecciones
- **MsgMeltToast**: Para notificaciones toast usando Melt-UI

---

## Flujo de Validación Completo

```
Usuario pulsa "Guardar cambios"
    ↓
SuperForm valida el formulario (lado cliente)
    ↓
onUpdate se ejecuta
    ↓
Si hay errores (form.valid = false):
    → Toast aparece INMEDIATAMENTE ❌
    → Formulario NO se envía
    → Campos con errores se marcan
    
Si no hay errores (form.valid = true):
    → Formulario se envía al servidor
    ↓
    Action del servidor recibe los datos
    ↓
    Validación en servidor (superValidate)
    ↓
    Si hay errores de validación:
        → Flash message de error
        → Return fail(400, { form })
        → onError se ejecuta en cliente
        → Toast de error
    ↓
    Si validación OK:
        → Llamada a API
        ↓
        Si API responde con error:
            → Flash message de error (según código HTTP)
            → Return fail(status, { form })
            → Toast de error
        ↓
        Si API responde OK:
            → Flash message de éxito
            → Redirect a página de edición
            → Toast de éxito
```

---

## Componentes del Sistema

### 1. Schema de Validación (Zod)

**Archivo**: `src/routes/(backoffice)/activities/activity-form.schema.ts`

Define las reglas de validación del formulario:

```typescript
export const activityFormSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200),
  slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres').max(100),
  descriptionShort: z.string().min(3, 'El campo debe tener al menos 3 caracteres'),
  // ... más campos
});
```

### 2. Página de Edición (Cliente)

**Archivo**: `src/routes/(backoffice)/activities/[slug]/edit/+page.svelte`

#### Configuración de SuperForm

```svelte
<script lang="ts">
  import MsgMeltToast from '$lib/components/msg/MsgMeltToast.svelte';
  
  let toastComponent: MsgMeltToast;
  
  const { form, errors, enhance, message } = superForm(data.form, {
    dataType: 'json',
    onUpdate({ form }) {
      // Se ejecuta después de la validación pero antes del envío
      if (!form.valid) {
        // Mostrar toast inmediatamente cuando hay errores de validación
        toastComponent?.addToast({
          data: {
            title: 'Errores en el formulario',
            description: 'Por favor, corrige los errores marcados en el formulario.',
            type: 'error'
          }
        });
      }
    },
    onError({ result }) {
      // Mostrar toast cuando hay errores de validación del servidor
      if (result.type === 'failure' && result.status === 400) {
        toastComponent?.addToast({
          data: {
            title: 'Errores en el formulario',
            description: 'Por favor, corrige los errores marcados en el formulario.',
            type: 'error'
          }
        });
      }
    }
  });
</script>

<!-- Formulario -->
<form id="edit-form" method="POST" use:enhance>
  <!-- Campos del formulario -->
</form>

<!-- Componente Toast -->
<MsgMeltToast bind:this={toastComponent} />
```

**Callbacks importantes:**
- **`onUpdate`**: Se ejecuta después de la validación cliente pero antes del envío. Si `form.valid = false`, muestra toast y previene el envío.
- **`onError`**: Se ejecuta cuando el servidor responde con error (status 400).

### 3. Action del Servidor

**Archivo**: `src/routes/(backoffice)/activities/[slug]/edit/+page.server.ts`

```typescript
import { setFlashMessage } from '$lib/server/flashMessages';

export const actions: Actions = {
  default: async ({ request, params, fetch, cookies }) => {
    // 1. Validar formulario
    const form = await superValidate(request, zod(activityFormSchema));
    
    if (!form.valid) {
      // Errores de validación
      setFlashMessage(cookies, {
        type: 'error',
        message: 'Por favor, corrige los errores del formulario.'
      });
      return fail(400, { form });
    }
    
    try {
      // 2. Llamar a la API
      await api.activities.update(fetch, params.slug, form.data);
      
      // 3. Éxito - Flash message y redirect
      setFlashMessage(cookies, {
        type: 'success',
        message: 'Los cambios se guardaron correctamente.'
      });
      
      throw redirect(303, `/activities/${params.slug}/edit`);
      
    } catch (err) {
      // 4. Manejar errores de API
      if (err && typeof err === 'object' && 'status' in err && err.status === 303) {
        throw err; // Dejar pasar el redirect
      }
      
      let errorMessage = 'Error al guardar los cambios.';
      
      if (err instanceof ApiError && err.status) {
        switch (err.status) {
          case 400:
            errorMessage = 'Los datos enviados no son válidos.';
            break;
          case 404:
            errorMessage = 'El elemento no existe.';
            break;
          case 409:
            errorMessage = 'Ya existe un elemento con estos datos.';
            break;
          case 500:
            errorMessage = 'Error del servidor. Por favor, inténtalo más tarde.';
            break;
          default:
            errorMessage = `Error al guardar los cambios (código ${err.status}).`;
        }
      }
      
      setFlashMessage(cookies, {
        type: 'error',
        message: errorMessage
      });
      
      return fail(err instanceof ApiError ? err.status || 500 : 503, { form });
    }
  }
};
```

### 4. Sistema de Flash Messages

**Archivo**: `src/lib/server/flashMessages.ts`

Permite persistir mensajes entre redirecciones usando cookies:

```typescript
export function setFlashMessage(cookies: Cookies, flash: FlashMessage): void {
  cookies.set(FLASH_COOKIE_NAME, JSON.stringify(flash), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 // 60 segundos
  });
}

export function getFlashMessage(cookies: Cookies): FlashMessage | null {
  const flashCookie = cookies.get(FLASH_COOKIE_NAME);
  if (!flashCookie) return null;
  
  // Eliminar la cookie después de leerla
  cookies.delete(FLASH_COOKIE_NAME, { path: '/' });
  
  return JSON.parse(flashCookie);
}
```

### 5. Layout del Servidor

**Archivo**: `src/routes/(backoffice)/+layout.server.ts`

Lee el flash message y lo pasa al layout:

```typescript
import { getFlashMessage } from '$lib/server/flashMessages';

export const load: LayoutServerLoad = async ({ cookies }) => {
  const alert = getFlashMessage(cookies);
  
  return {
    alert  // Disponible en $page.data.alert
  };
};
```

### 6. Componente Toast

**Archivo**: `src/lib/components/msg/MsgMeltToast.svelte`

Muestra notificaciones toast usando Melt-UI:

```svelte
<script lang="ts">
  import { createToaster, melt } from '@melt-ui/svelte';
  import { page } from '$app/stores';
  
  const {
    elements: { content, title, description, close },
    helpers: { addToast },
    states: { toasts },
    actions: { portal }
  } = createToaster<ToastData>();
  
  // Integración automática con flash messages
  const alert = $derived(
    ($page.form?.alert as AlertMessage | undefined) ||
    ($page.data?.alert as AlertMessage | undefined)
  );
  
  $effect(() => {
    if (alert) {
      addToast({
        data: {
          title: alert.type,
          description: alert.message,
          type: alert.type
        }
      });
    }
  });
  
  // Exportar addToast para uso manual
  export { addToast };
</script>
```

**Integración en Layout**: `src/routes/(backoffice)/+layout.svelte`

```svelte
<script>
  import MsgMeltToast from '$lib/components/msg/MsgMeltToast.svelte';
</script>

<main>
  {@render children()}
</main>

<MsgMeltToast />
```

---

## Códigos de Estado HTTP Manejados

### Errores del Cliente (4xx)

- **400 Bad Request**: Datos inválidos o validación fallida
- **401 Unauthorized**: No autenticado
- **403 Forbidden**: No autorizado
- **404 Not Found**: Elemento no existe
- **409 Conflict**: Conflicto (ej: slug duplicado, elemento tiene dependencias)
- **422 Unprocessable Entity**: Validación fallida en servidor

### Errores del Servidor (5xx)

- **500 Internal Server Error**: Error del servidor
- **503 Service Unavailable**: Servicio no disponible

---

## Tipos de Notificaciones Toast

### 1. Validación Cliente (Inmediata)

**Cuándo**: Formulario tiene errores antes de enviar
**Dónde**: `onUpdate` callback en `+page.svelte`
**Tipo**: `error`
**Mensaje**: "Errores en el formulario - Por favor, corrige los errores marcados"

### 2. Validación Servidor (Después de envío)

**Cuándo**: Servidor rechaza datos (status 400)
**Dónde**: `onError` callback en `+page.svelte`
**Tipo**: `error`
**Mensaje**: "Errores en el formulario - Por favor, corrige los errores marcados"

### 3. Error de API

**Cuándo**: API responde con error (404, 409, 500, etc.)
**Dónde**: Flash message desde action del servidor
**Tipo**: `error`
**Mensaje**: Específico según código HTTP

### 4. Guardado Exitoso

**Cuándo**: API responde OK (200)
**Dónde**: Flash message desde action del servidor
**Tipo**: `success`
**Mensaje**: "Los cambios se guardaron correctamente."

---

## Aplicación a Otros Recursos

Este mismo patrón se puede aplicar a otros recursos (attractions, destinations, etc.):

1. **Schema de validación**: Crear en `[resource]-form.schema.ts`
2. **Página de edición**: Configurar superForm con `onUpdate` y `onError`
3. **Action del servidor**: Usar `setFlashMessage` para errores y éxitos
4. **Componente toast**: Añadir `<MsgMeltToast bind:this={toastComponent} />`

---

## Ventajas del Sistema

✅ **Validación inmediata**: Usuario ve errores sin esperar respuesta del servidor
✅ **Feedback consistente**: Mismo formato de notificaciones para todos los casos
✅ **Persistencia**: Flash messages sobreviven a redirecciones
✅ **Reutilizable**: Mismo patrón para todos los formularios
✅ **Progressive enhancement**: Funciona sin JavaScript (flash messages en layout)
✅ **UX mejorada**: Notificaciones toast no invasivas y auto-desaparecen

---

## Archivos Clave del Sistema

```
src/
├── lib/
│   ├── components/
│   │   └── msg/
│   │       └── MsgMeltToast.svelte          # Componente toast
│   └── server/
│       └── flashMessages.ts                  # Sistema de flash messages
│
├── routes/
│   └── (backoffice)/
│       ├── +layout.server.ts                 # Lee flash messages
│       ├── +layout.svelte                    # Renderiza MsgMeltToast global
│       └── activities/
│           ├── activity-form.schema.ts       # Schema de validación Zod
│           └── [slug]/
│               └── edit/
│                   ├── +page.server.ts       # Action con validación servidor
│                   └── +page.svelte          # Form con validación cliente
```
