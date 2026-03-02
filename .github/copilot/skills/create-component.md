# Skill: Create Reusable Component

Crea un componente Svelte reutilizable siguiendo las convenciones del proyecto y los patrones de componentes existentes. Este skill ayuda a extraer código repetitivo en componentes mantenibles.

## Uso

```bash
# Interactivo - el agente preguntará detalles
create-component

# Con argumentos
create-component <component-name> <type>
```

## Ejemplos

```bash
create-component StatusBadge ui
create-component FormDatePicker forms
create-component DataTable shared
```

## ¿Cuándo usar este Skill?

- ✅ Tienes código HTML/Svelte repetido en varias páginas
- ✅ Quieres crear un componente reutilizable
- ✅ Necesitas seguir las convenciones del proyecto
- ✅ Quieres usar Svelte 5 runes correctamente

## Workflow Detallado

### Paso 1: Identificar el Componente

El agente debe preguntar:

1. **¿Qué tipo de componente?**
   - `forms` - Componente de formulario (va en `$lib/components/forms/`)
   - `ui` - Componente UI general (va en `$lib/components/`)
   - `shared` - Componente compartido específico de la app

2. **¿Qué hace el componente?**
   - Describir funcionalidad en 1-2 líneas
   - Ejemplo: "Muestra un badge de estado con colores según el valor"

3. **¿Qué props necesita?**
   - Listar props y sus tipos
   - Ejemplo: `value: string`, `size?: 'sm' | 'md' | 'lg'`

4. **¿Tiene estado interno?**
   - ¿Necesita `$state()`?
   - ¿Necesita `$derived()`?
   - ¿Necesita `$effect()`?

5. **¿De dónde extraemos el código?**
   - Ruta del archivo con el código a extraer
   - Ejemplo: `src/routes/(backoffice)/activities/+page.svelte`

Ubicaciones según tipo:

```
src/lib/components/
├── forms/                    ← Componentes de formulario
│   ├── FormInputText.svelte
│   ├── FormSelect.svelte
│   └── ...
├── [ComponentName].svelte    ← Componentes UI generales
└── ...
```

---

### Paso 2: Analizar Componente de Referencia

**Buscar componentes similares existentes:**

**Para componentes de formulario:**

- Ver: `src/lib/components/forms/FormInputText.svelte`
- Ver: `src/lib/components/forms/FormSelect.svelte`

**Para componentes UI:**

- Ver: `src/lib/components/StarRating.svelte`
- Ver: `src/lib/components/Tag.svelte`

**Extraer patrones:**

- ¿Cómo define props con `$props()`?
- ¿Usa `$bindable()` para two-way binding?
- ¿Usa `$derived()` para valores computados?
- ¿Cómo documenta con JSDoc?
- ¿Qué clases Tailwind usa?

---

### Paso 3: Crear Estructura del Componente

**Ubicación:** `src/lib/components/[ComponentName].svelte` o `src/lib/components/forms/[ComponentName].svelte`

**Template base:**

````svelte
<script lang="ts">
	/**
	 * [Nombre del Componente]
	 *
	 * [Descripción breve de 1-2 líneas]
	 *
	 * @example
	 * ```svelte
	 * // Ejemplo de uso básico
	 * <ComponentName
	 *   prop1="value"
	 *   prop2={variable}
	 * />
	 *
	 * // Ejemplo avanzado
	 * <ComponentName
	 *   prop1="value"
	 *   prop2={variable}
	 *   prop3={optional}
	 * />
	 * ```
	 */

	// Definir interfaz de props
	interface Props {
		prop1: string; // Prop requerida
		prop2?: number; // Prop opcional
		prop3?: 'a' | 'b' | 'c'; // Prop con opciones
		class?: string; // Classes adicionales
		[key: string]: any; // Rest props
	}

	// Desestructurar props con defaults
	let { prop1, prop2 = 10, prop3 = 'a', class: wrapperClass = '', ...restProps }: Props = $props();

	// Estado interno (si es necesario)
	let internalState = $state(initialValue);

	// Valores derivados (si es necesario)
	const computedValue = $derived(() => {
		return /* algún cálculo */;
	});

	// Efectos (si es necesario)
	$effect(() => {
		// Código que reacciona a cambios
	});
</script>

<!-- Markup con Tailwind -->
<div class="base-classes {wrapperClass}" {...restProps}>
	<!-- Contenido del componente -->
</div>
````

---

### Paso 4: Patrones Comunes por Tipo

#### A. Componente de Formulario

**Características:**

- Siempre incluir `FormErrorMsg`
- Props típicas: `id`, `label`, `value`, `error`
- Usar `$bindable()` para `value`
- Incluir `wrapperClass` para layout

**Template:**

```svelte
<script lang="ts">
	import FormErrorMsg from './FormErrorMsg.svelte';

	interface Props {
		id: string;
		label: string;
		value: string | number;
		error?: string | string[];
		placeholder?: string;
		disabled?: boolean;
		wrapperClass?: string;
		[key: string]: any;
	}

	let {
		id,
		label,
		value = $bindable(),
		error,
		placeholder,
		disabled = false,
		wrapperClass = 'md:col-span-12',
		...restProps
	}: Props = $props();
</script>

<div class={wrapperClass}>
	<label class="label text-sm" for={id}>
		<span>{label}</span>
	</label>

	<!-- Tu input/select/textarea aquí -->
	<input
		type="text"
		{id}
		name={id}
		class="input w-full"
		class:input-error={error}
		bind:value
		{placeholder}
		{disabled}
		{...restProps}
	/>

	<FormErrorMsg {error} />
</div>
```

---

#### B. Componente UI con Estado

**Características:**

- Props para configuración
- Estado interno con `$state()`
- Valores computados con `$derived()`

**Template:**

```svelte
<script lang="ts">
	interface Props {
		items: Item[];
		initialSelected?: string;
		onSelect?: (item: Item) => void;
		class?: string;
	}

	let { items, initialSelected, onSelect, class: wrapperClass = '' }: Props = $props();

	// Estado interno
	let selected = $state(initialSelected);

	// Valor derivado
	const selectedItem = $derived(() => {
		return items.find((i) => i.id === selected);
	});

	// Función handler
	function handleSelect(item: Item) {
		selected = item.id;
		onSelect?.(item);
	}
</script>

<div class="component-container {wrapperClass}">
	{#each items as item}
		<button onclick={() => handleSelect(item)} class:selected={selected === item.id}>
			{item.name}
		</button>
	{/each}
</div>
```

---

#### C. Componente Presentacional Simple

**Características:**

- Solo recibe props
- No tiene estado
- Puramente visual

**Template:**

```svelte
<script lang="ts">
	interface Props {
		value: string;
		type?: 'success' | 'error' | 'warning';
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let { value, type = 'success', size = 'md', class: wrapperClass = '' }: Props = $props();

	const typeClasses = $derived(() => {
		switch (type) {
			case 'success':
				return 'bg-green-100 text-green-800';
			case 'error':
				return 'bg-red-100 text-red-800';
			case 'warning':
				return 'bg-yellow-100 text-yellow-800';
			default:
				return '';
		}
	});

	const sizeClasses = $derived(() => {
		switch (size) {
			case 'sm':
				return 'text-xs px-2 py-1';
			case 'md':
				return 'text-sm px-3 py-1.5';
			case 'lg':
				return 'text-base px-4 py-2';
			default:
				return '';
		}
	});
</script>

<span class="inline-flex items-center rounded {typeClasses()} {sizeClasses()} {wrapperClass}">
	{value}
</span>
```

---

### Paso 5: Two-Way Binding con $bindable()

**Cuándo usar:**

- Componentes de formulario
- Cualquier componente que modifica un valor del padre

**Ejemplo:**

```svelte
<script lang="ts">
	interface Props {
		value: string;
	}

	let { value = $bindable() }: Props = $props();

	function updateValue(newValue: string) {
		value = newValue; // ← Automáticamente actualiza el padre
	}
</script>

<input bind:value />
```

**Uso en padre:**

```svelte
<script>
	let myValue = $state('');
</script>

<CustomInput bind:value={myValue} />
<!-- myValue se actualiza automáticamente -->
```

---

### Paso 6: Documentación con JSDoc

**Siempre incluir:**

````svelte
<script lang="ts">
	/**
	 * StatusBadge Component
	 *
	 * Muestra un badge de estado con colores según el tipo.
	 *
	 * @example
	 * ```svelte
	 * // Uso básico
	 * <StatusBadge value="Activo" type="success" />
	 *
	 * // Con tamaño personalizado
	 * <StatusBadge value="Error" type="error" size="lg" />
	 * ```
	 */

	interface Props {
		/** Texto a mostrar en el badge */
		value: string;
		/** Tipo de badge (determina el color) */
		type?: 'success' | 'error' | 'warning';
		/** Tamaño del badge */
		size?: 'sm' | 'md' | 'lg';
	}

	// ... resto del código
</script>
````

---

### Paso 7: Añadir Ejemplo a `/components`

**Ubicación:** `src/routes/(backoffice)/components/+page.svelte`

**Acción:** Añadir ejemplo visual del componente

```svelte
<label class="label mt-4">Ejemplo de [ComponentName]</label>
<p class="text-sm opacity-70">Descripción breve</p>
<div class="card p-4">
	<div class="space-y-4">
		<ComponentName prop1="valor1" />
		<ComponentName prop1="valor2" prop2={10} />
		<ComponentName prop1="valor3" class="custom-class" />
	</div>
</div>
```

---

### Paso 8: Checklist de Verificación

Antes de terminar:

- [ ] ✅ Usa Svelte 5 runes (`$props()`, `$state()`, `$derived()`)
- [ ] ✅ NO usa `export let` (legacy)
- [ ] ✅ NO usa `$:` (legacy)
- [ ] ✅ Documentado con JSDoc y ejemplos
- [ ] ✅ Props tipadas con TypeScript
- [ ] ✅ Usa solo Tailwind para estilos
- [ ] ✅ Sigue patrón de componentes similares
- [ ] ✅ Nombre en PascalCase
- [ ] ✅ Props desestructuradas correctamente
- [ ] ✅ Usa `$bindable()` si modifica valores del padre
- [ ] ✅ Ejemplo añadido a `/components`
- [ ] ✅ Funciona correctamente

---

## Ejemplos de Componentes

### Ejemplo 1: Badge de Estado

```svelte
<script lang="ts">
	/**
	 * StatusBadge - Badge de estado con colores
	 */
	interface Props {
		status: 'ACTIVE' | 'DRAFT' | 'INACTIVE';
		class?: string;
	}

	let { status, class: wrapperClass = '' }: Props = $props();

	const statusConfig = $derived(() => {
		switch (status) {
			case 'ACTIVE':
				return { text: 'Activo', class: 'badge-success' };
			case 'DRAFT':
				return { text: 'Borrador', class: 'badge-warning' };
			case 'INACTIVE':
				return { text: 'Inactivo', class: 'badge-error' };
		}
	});
</script>

<span class="badge {statusConfig().class} {wrapperClass}">
	{statusConfig().text}
</span>
```

### Ejemplo 2: Loading Spinner

```svelte
<script lang="ts">
	/**
	 * LoadingSpinner - Spinner de carga
	 */
	interface Props {
		size?: 'sm' | 'md' | 'lg';
		text?: string;
	}

	let { size = 'md', text }: Props = $props();

	const sizeClass = $derived(() => {
		switch (size) {
			case 'sm':
				return 'loading-sm';
			case 'md':
				return 'loading-md';
			case 'lg':
				return 'loading-lg';
		}
	});
</script>

<div class="flex items-center gap-2">
	<span class="loading loading-spinner {sizeClass()}"></span>
	{#if text}
		<span>{text}</span>
	{/if}
</div>
```

### Ejemplo 3: Data Table Cell

```svelte
<script lang="ts">
	/**
	 * TableCell - Celda de tabla reutilizable
	 */
	interface Props {
		value: string | number | null;
		type?: 'text' | 'number' | 'date' | 'badge';
		align?: 'left' | 'center' | 'right';
		class?: string;
	}

	let { value, type = 'text', align = 'left', class: wrapperClass = '' }: Props = $props();

	const alignClass = $derived(() => {
		switch (align) {
			case 'left':
				return 'text-left';
			case 'center':
				return 'text-center';
			case 'right':
				return 'text-right';
		}
	});
</script>

<td class="{alignClass()} {wrapperClass}">
	{#if value === null}
		<span class="text-base-content/50">—</span>
	{:else if type === 'badge'}
		<span class="badge badge-sm">{value}</span>
	{:else}
		{value}
	{/if}
</td>
```

---

## Errores Comunes y Soluciones

### ❌ Error: Cannot access 'variable' before initialization

**Causa:** Usas una variable antes de declararla en `$props()`

**Solución:** Declarar primero con `$props()`, luego usar

---

### ❌ Error: 'export let' is not supported

**Causa:** Usas sintaxis Svelte 4

**Solución:** Cambiar a `$props()`

```svelte
// ❌ Svelte 4 export let value: string; // ✅ Svelte 5 let {value}: Props = $props();
```

---

### ❌ Error: Reactive declaration not working

**Causa:** Usas `$:` en lugar de `$derived()`

**Solución:** Usar `$derived()`

```svelte
// ❌ Svelte 4 $: computed = value * 2; // ✅ Svelte 5 const computed = $derived(() => value * 2);
```

---

### ❌ Warning: 'bind:value' not updating parent

**Causa:** Falta `$bindable()` en la prop

**Solución:**

```svelte
// ❌ No funciona two-way binding let {value}: Props = $props(); // ✅ Two-way binding let {(value =
	$bindable())}: Props = $props();
```

---

## Notas Importantes

- 🎯 **Siempre** usa Svelte 5 runes - NO sintaxis legacy
- 🎯 **Siempre** documenta con JSDoc y ejemplos
- 🎯 **Siempre** usa TypeScript para props
- 🎯 **Siempre** usa solo Tailwind - NO CSS inline o modules
- 🎯 **Nunca** uses `export let` o `$:` (Svelte 4)
- 🎯 **Nunca** uses `createEventDispatcher` - usa callbacks en props
- 🎯 **Revisa** componentes similares antes de crear nuevos

---

## Referencias

- Componentes de formulario: `src/lib/components/forms/`
- Componentes UI: `src/lib/components/`
- Página de ejemplos: `/components` en el navegador
- Documentación Svelte 5: https://svelte-5-preview.vercel.app/docs/runes
