# Componente de PdpReviewsAverage:

Necesito hacer un componente reutilizable llamado `PdpReviewsAverage.svelte` en `src/lib/components/marketplace`, y hoja de estilos (si fuese necesaria) `.pdp-revews-average` en: `src/lib/styles/marketplace/components`

El componente debe seguir la línaa de los demás componentes en:
`src/lib/components/marketplace`

## Ubicación

El componente se usará en la página de detalle de una actividad:

@src/routes/(marketplace)/actividad/[slug]/+page.svelte#322

## Datos

Debemos pedir las estadísticas de las reviews de la actual actividad en `src/routes/(marketplace)/actividad/[slug]/+page.server.ts`

El endpoint correspondiente tiene este formato:
`http://localhost:5555/reviews/<activity_id>/stats`

La respuesta debería tener este formato:

```
{
  "activityId": "0638ec4e313d50b32c27b64581df2180",
  "total": 12,
  "averageRating": 3.33,
  "distribution": [
    {
      "stars": 5,
      "count": 4,
      "percentage": 33.33
    },
    {
      "stars": 4,
      "count": 3,
      "percentage": 25
    },
    {
      "stars": 3,
      "count": 2,
      "percentage": 16.67
    },
    {
      "stars": 2,
      "count": 2,
      "percentage": 16.67
    },
    {
      "stars": 1,
      "count": 1,
      "percentage": 8.33
    }
  ]
}
```

## Estructura, subcomponentes y layout

El componente está divido en dos mitades horizontales.

En la parte izquierda:

- el valor numérico de `averageRating`
- Componente @src/lib/components/marketplace/StarRating.svelte en el tamaño más grande disponible
- texto con `Según ${total} opiniones de ${activity.title}`

En la parte derecha:

- 5 rows en vertical, dentro de cada row:
  - Literal: `n estrellas`
  - Componente: @src/lib/components/marketplace/Progressbar.svelte que reflejará el valor `percentaje` de ese número de estrellas.
  - Porcentaje numérico limitado a 3 decimales (`87.456%`), si no hay suficientes decimales redondearemos con `0` para que las líneas queden alienadas (`56.100%`)
  - Un checkbox (más adelante vemos la funcionalidad del checkbox)

## Responsive

En mobile, el bloque de la izquierda se colocará encima y el de la derecha debajo.

## Funcionalidad

Cuando el usuario pulsa uno de lo checkboxes de cada una las líneas correspondientes a un número de estrellas, filtraremos el listado de reviews que está más abajo en la misma página:

@src/routes/(marketplace)/actividad/[slug]/+page.svelte#327-398

El formato de la URL para solicitar el filtrado a la API es la siguiente:

`GET /reviews/550e8400-e29b-41d4-a716-000000000001?stars=1,4,5`

Pasando las estrellas que tengan el checkbox activado (pueden ser varias). Se desarrollará todo acorde a los estándares de SveteKit 5

## Estilos

Emplearemos siempre que sea posible las variables de Tailwind
