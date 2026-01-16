# Utils

Esta carpeta contiene **funciones utilitarias puras** y reutilizables.

Son helpers que:

- no dependen del DOM
- no dependen de Svelte
- no tienen efectos secundarios
- pueden usarse tanto en cliente como en servidor

## Qué SÍ va aquí

- Helpers para `URLSearchParams`
- Parseo / serialización de datos
- Funciones de fechas, strings, arrays, números
- Pequeñas abstracciones reutilizables

Ejemplos:

- `url.ts` → helpers para query params (`forwardFilters`, `setParam`, etc.)
- `dates.ts` → formateo o normalización de fechas
- `filters.ts` → contratos de filtros permitidos

Ejemplo típico:

```ts
export function forwardSearchParams(
  source: URLSearchParams,
  target: URLSearchParams,
  allowed: readonly string[]
) {
  // ...
}
```
