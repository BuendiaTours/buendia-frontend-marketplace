# Actions

Esta carpeta contiene **Svelte actions**.

Una _action_ en Svelte es una función que:

- se aplica directamente a un nodo del DOM usando `use:`
- añade comportamiento al elemento (eventos, listeners, efectos, etc.)
- puede devolver un `destroy()` para limpieza

## Qué SÍ va aquí

- Funciones que se usan como `use:algo` en el markup
- Lógica que depende del DOM o interactúa con él
- Comportamientos reutilizables de UI

Ejemplos:

- `checkAll.ts` → marcar/desmarcar checkboxes
- `confirmAction.ts` → confirmar acciones antes de navegar
- `photoswipeGallery.ts` → inicializar librerías JS sobre nodos HTML

Ejemplo de uso:

```svelte
<input use:checkAll />
<a use:confirmAction />
```
