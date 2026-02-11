# Storybook Marketplace

**Documentación de componentes del Marketplace**

Este Storybook está configurado **solo para componentes del marketplace** (parte pública).  
**NO** incluye componentes del backoffice.

---

## 🚀 Uso

### Iniciar Storybook

```bash
npm run storybook
```

Se abre en http://localhost:6006

### Build para Deploy

```bash
npm run build-storybook
```

Genera `storybook-static-marketplace/` para deploy a Netlify/Vercel.

---

## 📝 Crear Nuevas Stories

### 1. Crear tu componente

```svelte
<!-- src/lib/components/marketplace/Button.svelte -->
<script lang="ts">
	let { label, variant = 'primary' }: { label: string; variant?: 'primary' | 'secondary' } =
		$props();
</script>

<button class="btn btn-{variant}">
	{label}
</button>
```

### 2. Crear la story al lado

```svelte
<!-- src/lib/components/marketplace/Button.stories.svelte -->
<script context="module">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Button from './Button.svelte';

	const { Story } = defineMeta({
		title: 'Marketplace/Components/Button',
		component: Button,
		tags: ['autodocs'],
		argTypes: {
			label: { control: 'text' },
			variant: { control: 'select', options: ['primary', 'secondary'] }
		}
	});
</script>

<Story name="Primary" args={{ label: 'Click me', variant: 'primary' }} />
<Story name="Secondary" args={{ label: 'Click me', variant: 'secondary' }} />
```

### 3. Ver en Storybook

Automáticamente aparece en la navegación:

```
Marketplace/
└── Components/
    └── Button
        ├── Primary
        └── Secondary
```

---

## 🎨 Organización de Stories

### Por categoría:

```
Marketplace/
├── Components/         # Componentes reutilizables
│   ├── ActivityCard
│   ├── PhotoGallery
│   └── Button
├── Layout/            # Header, Footer
│   ├── Header
│   └── Footer
└── Forms/             # Inputs, selects
    ├── SearchBar
    └── DatePicker
```

### Por estado:

Dentro de cada componente:

- **Default** - Estado normal
- **Loading** - Cargando datos
- **Empty** - Sin datos
- **Error** - Estado de error
- **Variants** - Variaciones (tamaños, colores)

---

## 🔧 Configuración

### CSS Importado

**Solo Tailwind** (sin DaisyUI):

- `src/routes/layout.css` - Tailwind base
- `src/routes/(marketplace)/layout-marketplace.css` - Custom marketplace
- `photoswipe/style.css` - Lightbox de imágenes

**NO se importa:**

- ❌ `layout-backoffice.css` (DaisyUI + themes)
- ❌ Componentes backoffice
- ❌ Estilos backoffice

### Viewports Configurados

- **Mobile:** 375x667
- **Tablet:** 768x1024
- **Desktop:** 1280x800

Cambiar en toolbar de Storybook para probar responsive.

### Accesibilidad (a11y)

Addon habilitado. Verás warnings de accesibilidad en el panel "Accessibility".

---

## 📚 Recursos

- **Storybook Docs:** https://storybook.js.org/docs
- **Svelte CSF:** https://github.com/storybookjs/addon-svelte-csf
- **Stories de ejemplo:** Ver `ActivityCard.stories.svelte` y `PhotoGallery.stories.svelte`

---

## 🧪 Testing de Componentes

Vitest integrado para testing:

```bash
# Run tests
npx vitest --project=storybook

# Run tests en watch mode
npx vitest --project=storybook --watch
```

---

## 🚀 Deploy

### Netlify

```toml
# netlify.toml
[build]
  command = "npm run build-storybook"
  publish = "storybook-static-marketplace"
```

### Vercel

```json
// vercel.json
{
	"buildCommand": "npm run build-storybook",
	"outputDirectory": "storybook-static-marketplace"
}
```

---

**Última actualización:** 2026-02-11
