# BndLightbox — Especificación técnica v3

## Contexto

Necesitamos un componente de lightbox propio porque PhotoSwipe no soporta de serie las funcionalidades avanzadas que requerimos (galerías con categorías/pestañas, layouts personalizados por categoría) y extenderlo sería más costoso que construir uno a medida.

Usaremos como base el builder `Dialog` de **MeltUI** (https://melt-ui.com/docs/builders/dialog), que ya está incluido en el proyecto, para obtener el comportamiento modal (focus trap, cierre con Esc, overlay, portal, accesibilidad base).

El componente se implementará en **Svelte 5** con runes y eventos modernos, dentro de un proyecto **SvelteKit con SSR**.

---

## 1. Requisitos funcionales

### 1.1 Funcionalidades básicas

| Funcionalidad          | Detalle                                                                                                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cerrar con botón       | Botón ✕ en la esquina superior derecha                                                                                                                                                         |
| Cerrar con overlay     | Click en el fondo oscuro cierra el lightbox                                                                                                                                                    |
| Cerrar con Esc         | Tecla `Escape` cierra el lightbox                                                                                                                                                              |
| Navegación ← →         | Flechas visibles en los laterales de la imagen                                                                                                                                                 |
| Navegación por teclado | Teclas `ArrowLeft` / `ArrowRight`                                                                                                                                                              |
| Swipe táctil           | Swipe horizontal izquierda/derecha en dispositivos táctiles                                                                                                                                    |
| Contador de posición   | Texto "X de N" en la esquina superior izquierda. Se anuncia con `aria-live` para lectores de pantalla                                                                                          |
| Spinner de carga       | Indicador visual mientras la imagen se está cargando                                                                                                                                           |
| Error de carga         | Estado de error visible si la imagen falla al cargar                                                                                                                                           |
| Precarga               | Se precargan la imagen anterior y la siguiente a la actual                                                                                                                                     |
| Animación cross-fade   | Transición cross-fade al cambiar de imagen. Duración y easing configurables vía CSS custom properties                                                                                          |
| Barra de título        | Barra opcional debajo de la imagen que muestra `title` o `alt`. Configuración global para activar/desactivar. Si está activa pero el `title` del item viene vacío, no se muestra para ese item |
| Wrap-around            | Configurable: si está activo, al llegar a la última imagen y pulsar "siguiente" se vuelve a la primera (y viceversa). Si está desactivado, las flechas se deshabilitan en los extremos         |
| Body scroll lock       | El scroll del `<body>` se bloquea mientras el lightbox está abierto                                                                                                                            |
| Sin zoom               | No implementamos zoom (no aporta valor y añade complejidad)                                                                                                                                    |

### 1.2 Comportamiento con imagen única

Si una galería-categoría contiene **una sola imagen**, se ocultan las flechas de navegación y el contador. El lightbox se comporta como un visor simple.

### 1.3 Accesibilidad

- **Focus trap** dentro del lightbox mientras está abierto (proporcionado por MeltUI Dialog).
- **`aria-label`** descriptivo en todos los controles interactivos (cerrar, anterior, siguiente, pestañas).
- **`aria-live="polite"`** en el contador "X de N" para anunciar cambios a lectores de pantalla.
- El lightbox se renderiza como portal al final del `<body>`.

### 1.4 Estilos

- Overlay de fondo y estilos generales (colores, opacidad, z-index) configurables vía **CSS custom properties**.
- **`z-index: 999`** por defecto. Se asume que no hay colisiones con otros elementos flotantes del proyecto.
- El HTML del lightbox se hace append justo al final del `<body>` (portal).

---

## 2. Galerías con categorías (pestañas)

### 2.1 Concepto

Un mismo lightbox abierto puede contener varias **galerías-categoría**, cada una con su conjunto de imágenes y, opcionalmente, su layout propio. Las categorías se presentan como **pestañas** en la parte superior de la ventana del lightbox.

### 2.2 Reglas

- Si solo hay **una** galería-categoría, las pestañas **no se muestran**.
- Si hay más de una, se muestran como pestañas.
- En **mobile** las pestañas se convierten en un **dropdown** para ahorrar espacio horizontal.
- Al cambiar de pestaña, se **recuerda** la posición (índice de imagen) en la que el usuario se encontraba en cada categoría.
- El contador "X de N" se actualiza según la categoría activa.

---

## 3. Layouts personalizados

### 3.1 Mecanismo

Cada galería-categoría puede definir un **layout personalizado** mediante **Svelte 5 `{#snippet}`**. Si no se proporciona snippet, se usa el layout por defecto (imagen centrada con título opcional debajo).

### 3.2 Datos que recibe el snippet

Los datos se **normalizan antes** de llegar al lightbox. El snippet recibe como parámetro el **item actual** (ya normalizado) y el **índice**, sin lógica de transformación dentro del layout.

### 3.3 Layout por defecto (Galería de producto)

- Imagen centrada con el mayor tamaño posible respetando el viewport.
- Barra de título debajo (si está habilitada y el item tiene `title`).
- Sin dependencia de `width`/`height` declarados: la imagen se adapta al viewport con CSS (`max-width: 100%`, `max-height`, `object-fit: contain`).

### 3.4 Layout de reviews (ejemplo de layout custom)

Estructura visual:

```
┌─────────────────────────────────────────────────┐
│  [Pestañas / Dropdown]                          │
├────────────────────────┬────────────────────────┤
│                        │  Usuario: JSmith       │
│                        │  ★★★★☆            │
│      [ IMAGEN ]        │                        │
│                        │  "Great product..."    │
│                        │                        │
├────────────────────────┴────────────────────────┤
│        ←  2 de 5  →                           │
└─────────────────────────────────────────────────┘
```

- **Desktop:** Imagen a la izquierda, bloque de datos del usuario a la derecha.
- **Mobile:** Se apila verticalmente — imagen arriba, datos de la review debajo.

#### Navegación aplanada entre usuarios

La navegación en este layout es **plana y continua** a través de todos los attachments de todos los usuarios:

- Las flechas avanzan/retroceden entre imágenes individuales.
- Cuando se cruza el límite de un usuario al siguiente (o anterior), se actualiza tanto la imagen como el bloque de datos del usuario.
- Si estoy en la primera imagen del usuario 2 y pulso "anterior", voy a la **última** imagen del usuario 1.

---

## 4. Responsive

Es **crítico** que todo funcione correctamente en mobile. El proyecto tiene un alto porcentaje de visitas desde dispositivos móviles.

| Aspecto               | Desktop                                                      | Mobile                                        |
| --------------------- | ------------------------------------------------------------ | --------------------------------------------- |
| Pestañas de categoría | Pestañas horizontales                                        | Dropdown                                      |
| Layout de reviews     | Lado a lado (imagen + datos)                                 | Apilado vertical (imagen arriba, datos abajo) |
| Navegación            | Flechas laterales + teclado                                  | Swipe táctil + flechas (más pequeñas)         |
| Imagen                | Se adapta al viewport sin necesidad de declarar width/height | Igual                                         |

### 4.1 Imágenes sin dimensiones explícitas

Muchas imágenes provienen de servicios externos que **no proporcionan ancho/alto**. El componente **no debe requerir** estos datos. El dimensionado se resuelve con CSS (`object-fit: contain`, `max-width`, `max-height` relativos al viewport).

---

## 5. Interfaz de datos (contrato)

El lightbox recibe siempre una **estructura normalizada**. La transformación de los datos originales (multimedias de producto, reviews, etc.) se realiza **fuera** del componente.

```typescript
interface BndLightboxConfig {
	/** Categorías/galerías a mostrar */
	categories: BndLightboxCategory[];

	/** Navegación circular (default: false) */
	wrapAround?: boolean;

	/** Mostrar barra de título debajo de la imagen (default: true) */
	showTitle?: boolean;

	/** Categoría activa inicial (default: primera categoría) */
	startCategory?: string;

	/** Índice de imagen inicial dentro de la categoría (default: 0) */
	startIndex?: number;
}

interface BndLightboxCategory {
	/** Identificador único de la categoría */
	id: string;

	/** Texto que aparece en la pestaña */
	label: string;

	/** Items de esta categoría (ya normalizados) */
	items: BndLightboxItem[];

	/** Snippet de Svelte 5 para layout custom. Si no se proporciona → layout default */
	layout?: Snippet<[BndLightboxItemContext]>;
}

interface BndLightboxItem {
	/** URL de la imagen a mostrar */
	src: string;

	/** Texto alternativo */
	alt?: string;

	/** Título para la barra inferior */
	title?: string;

	/**
	 * Datos adicionales arbitrarios para layouts custom.
	 * Ejemplo en reviews: { user, rating, content, date }
	 */
	meta?: Record<string, unknown>;
}

interface BndLightboxItemContext {
	/** El item actual */
	item: BndLightboxItem;

	/** Índice del item dentro de su categoría */
	index: number;

	/** Total de items en la categoría */
	total: number;
}
```

---

## 6. API pública del componente

### 6.1 Múltiples instancias en la misma página

Puede haber **más de un lightbox** en la misma página, cada uno con sus propias categorías y configuración. Cada instancia se identifica mediante un **`id`** único que vincula el componente `<BndLightbox>` con su action `use:bndLightbox` correspondiente.

```svelte
<!-- Lightbox principal de producto -->
<div use:bndLightbox={{ lightboxId: 'product-lightbox' }}>
	<img src="thumb1.jpg" data-lightbox-src="full1.jpg" data-lightbox-group="fotos" />
	<img src="thumb2.jpg" data-lightbox-src="full2.jpg" data-lightbox-group="fotos" />
</div>

<BndLightbox id="product-lightbox" bind:open={productOpen} config={productConfig} />

<!-- Lightbox secundario (ej: comparador, ficha técnica, etc.) -->
<div use:bndLightbox={{ lightboxId: 'specs-lightbox' }}>
	<img src="spec-thumb1.jpg" data-lightbox-src="spec1.jpg" data-lightbox-group="specs" />
</div>

<BndLightbox id="specs-lightbox" bind:open={specsOpen} config={specsConfig} />
```

El vínculo entre la action y el componente se resuelve mediante un **registro interno a nivel de contexto de Svelte** (no un singleton global), lo que lo hace compatible con SSR y con múltiples instancias.

### 6.2 Apertura programática (Opción B — Bindable state)

Cada instancia de `<BndLightbox>` expone un **state bindable `open`**. Para abrir el lightbox programáticamente basta con cambiar ese estado a `true`. La categoría e índice inicial se controlan vía `config.startCategory` y `config.startIndex`, que al ser props reactivas se pueden actualizar antes de abrir.

```svelte
<script>
  let isOpen = $state(false);
  let config = $state<BndLightboxConfig>({ categories: [...] });

  function openAtReview(index: number) {
    config.startCategory = 'reviews';
    config.startIndex = index;
    isOpen = true;
  }
</script>

<BndLightbox id="main" bind:open={isOpen} {config} />

<button onclick={() => openAtReview(3)}>Ver review #4</button>
```

**Ventajas de esta aproximación:**

- Idiomática en Svelte 5 (reactiva, declarativa).
- Sin singletons ni estado global.
- Compatible con SSR.
- Cada instancia es independiente; no hay ambigüedad sobre qué lightbox se abre.

### 6.3 Inicialización declarativa (action)

```svelte
<div use:bndLightbox={{ lightboxId: 'main' }}>
	<img src="thumb1.jpg" data-lightbox-src="full1.jpg" data-lightbox-group="product" />
	<img src="thumb2.jpg" data-lightbox-src="full2.jpg" data-lightbox-group="product" />
</div>
```

- La action `use:bndLightbox` recibe un objeto con **`lightboxId`** que la vincula a la instancia de `<BndLightbox>` con ese mismo `id`.
- Busca imágenes hijas con el atributo **`data-lightbox-src`** (URL de la imagen a tamaño completo).
- El atributo **`data-lightbox-group`** en cada imagen asocia esa imagen a una galería/grupo, permitiendo **múltiples galerías en la misma página**.
- Al hacer click en una imagen con estos data-attrs, se abre el lightbox vinculado en la posición correspondiente.

### 6.4 Eventos

El componente emite los siguientes eventos:

| Evento        | Payload                                  | Descripción                              |
| ------------- | ---------------------------------------- | ---------------------------------------- |
| `onopen`      | `{ categoryId, index }`                  | Se dispara al abrir el lightbox          |
| `onclose`     | `{ categoryId, index }`                  | Se dispara al cerrar el lightbox         |
| `onchange`    | `{ categoryId, index, item, direction }` | Cambio de imagen dentro de una categoría |
| `ontabchange` | `{ fromCategoryId, toCategoryId }`       | Cambio de pestaña/categoría              |

---

## 7. Consideraciones técnicas

### 7.1 SSR (SvelteKit)

El componente se usa en un proyecto SvelteKit con SSR. Toda lógica que acceda al DOM (action, event listeners, portal, registro de instancias) debe estar protegida con guardas (`browser`, `onMount`, `$effect`).

### 7.2 Rendimiento

- **Fase 1 (actual):** Las galerías tendrán pocos elementos (< 30). La precarga se limita a ±1 imagen respecto a la actual.
- **Fase 2 (futuro):** Si se necesitan galerías grandes, evaluar virtualización y estrategias de precarga más sofisticadas.

### 7.3 Soporte futuro para otros tipos de contenido

Actualmente solo se soportan imágenes. En el futuro podría necesitarse soporte para **vídeo** o **PDF**. La estrategia recomendada es que estos tipos de contenido tengan su **propio layout custom** (snippet), manteniendo `BndLightboxItem.src` como el recurso principal y usando `meta` para datos adicionales. Si se necesita discriminar tipo, se puede añadir un campo `type` a la interfaz:

```typescript
interface BndLightboxItem {
	src: string;
	type?: 'image' | 'video' | 'pdf'; // futuro
	alt?: string;
	title?: string;
	meta?: Record<string, unknown>;
}
```

### 7.4 URL / Deep linking

Pospuesto a **fase 2**. Para no cerrar la puerta, la arquitectura actual ya facilita la implementación futura:

- El estado del lightbox (abierto/cerrado, categoría activa, índice) ya es reactivo y accesible desde fuera vía `bind:open` y props.
- En fase 2 bastaría con añadir un `$effect` que sincronice ese estado con un hash en la URL (`#lightbox=product:3`) y un listener de `popstate` para el botón "atrás" del navegador.
- No se requiere ningún cambio arquitectónico en el componente; es una capa de sincronización externa.

---

## 8. CSS Custom Properties (referencia)

```css
/* Ejemplo de personalización */
.bnd-lightbox {
	--bnd-lightbox-overlay-bg: rgba(0, 0, 0, 0.9);
	--bnd-lightbox-overlay-z: 999;
	--bnd-lightbox-transition-duration: 300ms;
	--bnd-lightbox-transition-easing: ease-in-out;
	--bnd-lightbox-controls-color: #ffffff;
	--bnd-lightbox-counter-font-size: 0.875rem;
	--bnd-lightbox-title-font-size: 0.875rem;
	--bnd-lightbox-title-color: #ffffff;
}
```

---

## 9. Ejemplo de uso real (resumen de estructuras de datos)

### 9.1 Galería de producto (layout default)

Fuente de datos: array de `multimedias`, cada uno con `variants`. Se extrae la variante `MAX` como `src`.

Normalización:

```typescript
const productItems: BndLightboxItem[] = multimedias.map((m) => ({
	src: m.variants.find((v) => v.preset === 'MAX')?.url ?? m.originalUrl,
	alt: m.altText,
	title: m.title
}));
```

### 9.2 Galería de reviews (layout custom)

Fuente de datos: array de reviews, cada una con `attachments[]`, `user`, `averageRating`, `content`.

Normalización (navegación aplanada):

```typescript
const reviewItems: BndLightboxItem[] = reviews.flatMap((review) =>
	review.attachments.map((att) => ({
		src: att.url.value,
		alt: `Foto de ${review.user || 'usuario anónimo'}`,
		meta: {
			user: review.user || 'Anónimo',
			rating: review.averageRating,
			content: review.content,
			date: review.createdAt
		}
	}))
);
```
