# Actions

Esta carpeta contiene **Svelte actions**.

Una _action_ en Svelte es una función que:

- Se aplica directamente a un nodo del DOM usando `use:`
- Añade comportamiento al elemento (eventos, listeners, efectos, etc.)
- Puede devolver un `destroy()` para limpieza

## Qué SÍ va aquí

- Funciones que se usan como `use:algo` en el markup
- Lógica que depende del DOM o interactúa con él
- Comportamientos reutilizables de UI

Ejemplos:

- `checkAll.ts` → marcar/desmarcar checkboxes
- `confirmAction.ts` → confirmar acciones antes de navegar
- `photoswipeGallery.ts` → inicializar librerías JS sobre nodos HTML (backoffice)
- `bndLightboxAction.ts` → galería lightbox desde data-attrs, sin config manual (marketplace)

Ejemplo de uso:

```svelte
<input use:checkAll />
<a use:confirmAction />
```
