# Sveltekit PoC

Prueba de concepto de Sveltekit con Typescript, Tailwind y DaisyUI de cara a desarrollar un front para una API REST.

Arrancar el server: `npm run dev -- --open`

## Cosas a explicar en la documentación

- Tailwind
- DaisyUI
- Bit UI
- Componentes y nomenclatura `bnd-`
- Rutas
- Contextos? `(app)`
- Layouts
- Iconos
- Assets

## Organización de Estilos CSS

Este proyecto utiliza tres enfoques para los estilos CSS:

### 1. **Estilos con ámbito (Scoped Styles)**

Cada componente `.svelte` puede incluir su propio bloque `<style>` que solo afecta a ese componente. Ideal para estilos específicos que no se reutilizan.

```svelte
<div class="card">Contenido</div>

<style>
	.card {
		padding: 1rem;
	}
</style>
```

### 2. **Estilos globales base** (`src/routes/layout.css`)

Contiene la configuración de Tailwind CSS y sus plugins (DaisyUI, forms, typography). Se importa en el layout raíz y está disponible en toda la aplicación.

```css
@import 'tailwindcss';
@plugin '@tailwindcss/forms';
@plugin '@tailwindcss/typography';
@plugin 'daisyui';
```

### 3. **Estilos personalizados reutilizables** (`src/lib/styles/`)

Para componentes CSS personalizados, clases de utilidad adicionales o librerías externas que no están en Tailwind/DaisyUI. Se organizan en:

- `variables.css` - Variables CSS (colores, espaciados, etc.)
- `custom.css` - Clases personalizadas reutilizables

Estos archivos se importan en `src/routes/+layout.svelte` para estar disponibles globalmente.

### 4. Iconos

https://github.com/metonym/svelte-iconoir

# --- OLD README ---

# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
