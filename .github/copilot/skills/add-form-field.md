# Skill: Add Form Field

Añade un nuevo campo a un formulario existente siguiendo las convenciones del proyecto. Este skill guía paso a paso la adición de campos en forms, schemas de validación, tipos TypeScript y data handlers.

## Uso

```bash
# Interactivo - el agente preguntará detalles
add-form-field

# Con argumentos
add-form-field <form-name> <field-name> <field-type>
```

## Ejemplos

```bash
add-form-field booking-form guestCount number
add-form-field activity-edit notes textarea
add-form-field destination-create isActive checkbox
```

## ¿Cuándo usar este Skill?

- ✅ Necesitas añadir un campo a un formulario existente
- ✅ Quieres mantener consistencia entre schema, tipos y UI
- ✅ Necesitas validación Zod para el nuevo campo
- ✅ El formulario usa Superforms

## Workflow Detallado

### Paso 1: Identificar Archivos a Modificar

El agente debe preguntar:

1. **¿Qué formulario?** (ejemplo: activities/[slug]/edit)
2. **¿Qué campo añadir?** (ejemplo: maxParticipants)
3. **¿Qué tipo de campo?**
   - text (string)
   - number
   - email
   - textarea
   - select (enum/options)
   - checkbox (boolean)
   - slug
   - date
   - markdown
   - **array-strings** (string[] - ej: ["item1", "item2"])
   - **array-objects** (Array<{id, name}> - ej: [{id: "1", name: "Tag1"}])
   - **ordered-list** (Array<{id, name}> ordenable con drag & drop)

Archivos involucrados:

```
src/
├── lib/
│   ├── types.ts                          ← Añadir al type
│   └── schemas/
│       └── [resource].schema.ts          ← Añadir validación Zod
└── routes/
    └── (backoffice)/
        └── [resource]/
            └── [slug]/
                └── edit/
                    ├── +page.server.ts   ← Actualizar data handler
                    └── +page.svelte      ← Añadir componente visual
```

---

### Paso 2: Actualizar Type en `types.ts`

**Ubicación:** `src/lib/types.ts`

**Acción:** Añadir la propiedad al type correspondiente

**Ejemplo:**

```typescript
// Antes
export type Activity = {
	id: string;
	title: string;
	slug: string;
	descriptionShort?: string;
	// ... otros campos
};

// Después - añadir maxParticipants
export type Activity = {
	id: string;
	title: string;
	slug: string;
	descriptionShort?: string;
	maxParticipants?: number; // ← NUEVO campo
	// ... otros campos
};
```

**Tips:**

- Usar `?` si el campo es opcional
- Tipo `string` para texto, `number` para números, `boolean` para checkboxes
- `string | null` si la API puede devolver null

---

### Paso 3: Actualizar Schema de Validación Zod

**Ubicación:** `src/lib/schemas/[resource].schema.ts`

**Acción:** Añadir validación Zod para el nuevo campo

**Ejemplo para campo numérico:**

```typescript
import { z } from 'zod';

export const activityEditSchema = z.object({
	id: z.string(),
	title: z.string().min(1, 'El título es requerido'),
	slug: z.string().min(1, 'El slug es requerido'),
	descriptionShort: z.string().optional(),

	// ← NUEVO campo con validación
	maxParticipants: z
		.number({ invalid_type_error: 'Debe ser un número' })
		.int('Debe ser un número entero')
		.positive('Debe ser mayor a 0')
		.optional()
});
```

**Validaciones comunes por tipo:**

**Text:**

```typescript
fieldName: z.string().min(1, 'Campo requerido').max(100, 'Máximo 100 caracteres');
```

**Email:**

```typescript
email: z.string().email('Email inválido');
```

**Number:**

```typescript
price: z.number().positive('Debe ser positivo').optional();
```

**Checkbox:**

```typescript
isActive: z.boolean().default(false);
```

**Select:**

```typescript
status: z.enum(['ACTIVE', 'DRAFT', 'INACTIVE']);
```

**Optional:**

```typescript
notes: z.string().optional();
```

**Nullable:**

```typescript
endDate: z.string().nullable();
```

**Array de strings:**

```typescript
excluded: z.array(z.string()).default([]);
included: z.array(z.string()).default([]);
```

**Array de objetos {id, name}:**

```typescript
destinations: z.array(
	z.object({
		id: z.string(),
		name: z.string()
	})
).default([]);

tags: z.array(
	z.object({
		id: z.string(),
		name: z.string()
	})
).default([]);
```

**Array de objetos con validación mínima:**

```typescript
// Al menos debe tener 1 elemento
categories: z.array(
	z.object({
		id: z.string(),
		name: z.string()
	})
)
	.min(1, 'Debe seleccionar al menos una categoría')
	.default([]);
```

---

### Paso 4: Actualizar Data Handler en `+page.server.ts`

**Ubicación:** `src/routes/(backoffice)/[resource]/[slug]/edit/+page.server.ts`

**Acción:** Añadir el campo al objeto que se pasa al form

**Ejemplo:**

```typescript
// En el load function
export const load: PageServerLoad = async ({ fetch, params }) => {
	const activity = await api.activities.getBySlug(fetch, params.slug);

	const form = await superForm(
		{
			id: activity.id,
			title: activity.title,
			slug: activity.slug,
			descriptionShort: activity.descriptionShort,
			maxParticipants: activity.maxParticipants // ← NUEVO
			// ... otros campos
		},
		{
			validators: zod(activityEditSchema)
		}
	);

	return { form, activity };
};

// En el action
export const actions: Actions = {
	default: async ({ request, params, fetch }) => {
		const form = await superValidate(request, zod(activityEditSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await api.activities.update(fetch, params.slug, {
				title: form.data.title,
				slug: form.data.slug,
				descriptionShort: form.data.descriptionShort,
				maxParticipants: form.data.maxParticipants // ← NUEVO
				// ... otros campos
			});

			return { form };
		} catch (err) {
			// error handling...
		}
	}
};
```

**Para arrays de objetos {id, name} - Necesitas cargar los items disponibles:**

```typescript
// En el load function
export const load: PageServerLoad = async ({ fetch, params }) => {
	// ⚠️ IMPORTANTE: Cargar tanto el recurso como los items disponibles
	const [activity, availableDestinations, availableTags] = await Promise.all([
		api.activities.getBySlug(fetch, params.slug),
		api.destinations.getAll(fetch),
		api.tags.getAll(fetch)
	]);

	const form = await superValidate(
		{
			id: activity.id,
			title: activity.title,
			destinations: activity.destinations || [], // ← Array de objetos
			tags: activity.tags || [] // ← Array de objetos
			// ... otros campos
		},
		zod(activityEditSchema)
	);

	return {
		form,
		activity,
		availableDestinations: availableDestinations.data || [], // ← Items disponibles
		availableTags: availableTags || [] // ← Items disponibles
	};
};

// En el action
export const actions: Actions = {
	default: async ({ request, params, fetch }) => {
		const form = await superValidate(request, zod(activityEditSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await api.activities.update(fetch, params.slug, {
				title: form.data.title,
				destinations: form.data.destinations, // ← Array completo
				tags: form.data.tags // ← Array completo
				// ... otros campos
			});

			throw redirect(303, `/activities/${params.slug}`);
		} catch (err) {
			// error handling...
		}
	}
};
```

**⚠️ Importante:** Para arrays de objetos:

1. ✅ En `superForm()` inicial (load): Cargar datos del recurso
2. ✅ En `superForm()` inicial (load): Cargar items disponibles con `Promise.all()`
3. ✅ Retornar `availableItems` en el return del load
4. ✅ En el action: Pasar el array completo `form.data.fieldName`

---

**⚠️ Importante:** No olvidar añadir el campo en AMBOS lugares:

1. En el `superForm()` inicial (load)
2. En el objeto que se pasa a `api.*.update()` (action)

---

### Paso 5: Añadir Componente Visual en `+page.svelte`

**Ubicación:** `src/routes/(backoffice)/[resource]/[slug]/edit/+page.svelte`

**Acción:** Usar el componente de formulario apropiado

**Componentes disponibles en** `$lib/components/forms/`:

- `FormInputText` - Campos de texto/número/email
- `FormTextarea` - Texto multilínea
- `FormSelect` - Selects/dropdowns
- `FormInputSlug` - Slugs auto-generados
- `FormCheckboxGroup` - Checkboxes múltiples (para arrays de {id, name})
- `FormTagManager` - Gestión de tags (para arrays de {id, name})
- `FormOrderedList` - Listas ordenables con drag & drop (para arrays de {id, name})
- `FormTextList` - Listas de strings editables (para string[])
- `FormTextareaMarkdown` - Editor Markdown

**Ejemplo para campo numérico:**

```svelte
<FormInputText
	id="maxParticipants"
	label="Máximo de participantes"
	type="number"
	bind:value={$form.maxParticipants}
	error={$errors.maxParticipants}
	placeholder="Ej: 20"
	min="1"
	wrapperClass="md:col-span-6"
/>
```

**Ejemplo para textarea:**

```svelte
<FormTextarea
	id="notes"
	label="Notas internas"
	bind:value={$form.notes}
	error={$errors.notes}
	rows={4}
	placeholder="Escribe notas..."
	wrapperClass="md:col-span-12"
/>
```

**Ejemplo para select:**

```svelte
<FormSelect
	id="status"
	label="Estado"
	bind:value={$form.status}
	error={$errors.status}
	options={[
		{ id: 'ACTIVE', name: 'Activo' },
		{ id: 'DRAFT', name: 'Borrador' },
		{ id: 'INACTIVE', name: 'Inactivo' }
	]}
	wrapperClass="md:col-span-6"
/>
```

**Ejemplo para checkbox simple:**

```svelte
<div class="md:col-span-6">
	<label class="label cursor-pointer">
		<input type="checkbox" class="checkbox" bind:checked={$form.isActive} />
		<span class="label-text">Campo activo</span>
	</label>
</div>
```

**Props comunes:**

- `id`: ID único del campo (requerido)
- `label`: Texto del label (requerido)
- `bind:value`: Binding con `$form.*` (requerido)
- `error`: Binding con `$errors.*` (opcional pero recomendado)
- `placeholder`: Texto de ayuda (opcional)
- `wrapperClass`: Clases Tailwind para el contenedor (opcional)
- `badge`: Badge informativo como "opcional" o "read only" (opcional)

---

### Paso 6: Verificar y Probar

**Checklist de verificación:**

- [ ] ✅ Type añadido en `types.ts`
- [ ] ✅ Validación Zod añadida en schema
- [ ] ✅ Campo en `superForm()` inicial (load)
- [ ] ✅ Campo en objeto de update (action)
- [ ] ✅ Componente visual en `+page.svelte`
- [ ] ✅ Binding correcto (`$form.*` y `$errors.*`)
- [ ] ✅ Validación funciona en el formulario
- [ ] ✅ Datos se guardan correctamente

**Probar:**

1. Abrir el formulario en el navegador
2. Completar el nuevo campo
3. Enviar el formulario
4. Verificar que se guarda en la API
5. Recargar página - verificar que el valor persiste
6. Probar validaciones (dejar vacío si es required, etc.)

---

## Casos de Uso Comunes

### Añadir campo de texto opcional

```typescript
// types.ts
notes?: string;

// schema.ts
notes: z.string().optional()

// +page.svelte
<FormTextarea
  id="notes"
  label="Notas"
  bind:value={$form.notes}
  error={$errors.notes}
/>
```

### Añadir campo numérico con validación

```typescript
// types.ts
capacity: number;

// schema.ts
capacity: z
  .number({ invalid_type_error: 'Debe ser un número' })
  .int('Debe ser entero')
  .min(1, 'Mínimo 1')
  .max(1000, 'Máximo 1000')

// +page.svelte
<FormInputText
  id="capacity"
  label="Capacidad"
  type="number"
  bind:value={$form.capacity}
  error={$errors.capacity}
  min="1"
  max="1000"
/>
```

### Añadir campo email

```typescript
// types.ts
contactEmail?: string;

// schema.ts
contactEmail: z.string().email('Email inválido').optional()

// +page.svelte
<FormInputText
  id="contactEmail"
  label="Email de contacto"
  type="email"
  bind:value={$form.contactEmail}
  error={$errors.contactEmail}
  placeholder="ejemplo@email.com"
/>
```

### Añadir array de strings (string[])

**Ejemplo:** `excluded`, `included`, `itemsToBring`, `restrictions`

```typescript
// types.ts
excluded: string[];
included: string[];

// schema.ts
excluded: z.array(z.string()).default([]),
included: z.array(z.string()).default([])

// +page.server.ts (load)
excluded: apiData.excluded || [],
included: apiData.included || []

// +page.server.ts (action)
excluded: form.data.excluded,
included: form.data.included

// +page.svelte - Usa FormTextList
<FormTextList
  id="excluded"
  label="Elementos excluidos"
  bind:items={$form.excluded}
  error={$errors.excluded?._errors}
  placeholder="Escribe un elemento..."
  badge="opcional"
/>
```

**Características de FormTextList:**

- ✅ Drag & drop para reordenar
- ✅ Añadir/eliminar items individualmente
- ✅ Botón "Eliminar todos"
- ✅ Textareas auto-expandibles

---

### Añadir array de objetos {id, name} - Relacional

**Ejemplo:** `destinations`, `categories`, `tags`, `attractions`

**Tipo de dato de la API:**

```json
"destinations": [
  {
    "id": "96ec17be08fb52dc03d2caed251f962b",
    "name": "Barcelona"
  }
]
```

**¿Qué componente usar?**

Depende del comportamiento que necesites:

#### **Opción A: FormTagManager** (Recomendado para Tags)

Mejor para: Añadir/quitar elementos sin orden específico

```typescript
// types.ts
destinations: Array<{ id: string; name: string }>;

// schema.ts
destinations: z
  .array(
    z.object({
      id: z.string(),
      name: z.string()
    })
  )
  .default([])

// +page.server.ts (load)
destinations: apiData.destinations || []

// También necesitas cargar los items disponibles:
const [activity, availableDestinations] = await Promise.all([
  api.activities.getBySlug(fetch, params.slug),
  api.destinations.getAll(fetch) // ← Cargar opciones disponibles
]);

return {
  activity,
  form,
  availableDestinations: availableDestinations.data || []
};

// +page.server.ts (action)
destinations: form.data.destinations

// +page.svelte
<FormTagManager
  id="destinations"
  label="Destinos"
  bind:tags={$form.destinations}
  availableTags={data.availableDestinations}
  error={$errors.destinations?._errors}
  placeholder="Añade un destino..."
/>
```

**Características:**

- ✅ Combobox para buscar y seleccionar
- ✅ Tags visuales de items seleccionados
- ✅ Eliminar con botón X en cada tag
- ✅ Filtra items ya seleccionados

---

#### **Opción B: FormOrderedList** (Recomendado si el orden importa)

Mejor para: Cuando el orden de los elementos es importante

```typescript
// Mismos types y schema que arriba

// +page.svelte
<FormOrderedList
  id="destinations"
  label="Destinos"
  bind:items={$form.destinations}
  availableItems={data.availableDestinations}
  error={$errors.destinations?._errors}
  placeholder="Selecciona un destino..."
  emptyMessage="No hay destinos asociados"
/>
```

**Características:**

- ✅ Combobox para seleccionar
- ✅ Lista ordenable con drag & drop
- ✅ Muestra orden con números
- ✅ Botones para mover arriba/abajo
- ✅ Eliminar items individuales o todos

---

#### **Opción C: FormCheckboxGroup** (Para selección múltiple visual)

Mejor para: Pocos items fijos, selección visual directa

```typescript
// Mismos types y schema que arriba

// +page.svelte
<FormCheckboxGroup
  main_label="Destinos"
  id="destinations"
  name="destinations[]"
  key_title="name"
  key_value="id"
  bind:items={$form.destinations}
  availableItems={data.availableDestinations}
  error={$errors.destinations?._errors}
/>
```

**Características:**

- ✅ Grid de checkboxes
- ✅ Todos los items visibles a la vez
- ✅ Selección múltiple directa
- ⚠️ Menos ideal para muchos items (>10)

---

### **Guía de Decisión: ¿Qué componente usar?**

```
¿Es un array de strings simples (string[])?
├─ SÍ → FormTextList
└─ NO → ¿Es un array de objetos {id, name}?
    └─ SÍ → ¿El orden importa?
        ├─ SÍ → FormOrderedList
        └─ NO → ¿Son tags/categorías?
            ├─ SÍ → FormTagManager
            └─ NO → ¿Son pocos items (<10)?
                ├─ SÍ → FormCheckboxGroup
                └─ NO → FormTagManager
```

**Resumen rápido:**

| Campo                  | Tipo          | Orden importa | Componente          |
| ---------------------- | ------------- | ------------- | ------------------- |
| `excluded`, `included` | `string[]`    | Sí            | `FormTextList`      |
| `tags`, `categories`   | `{id,name}[]` | No            | `FormTagManager`    |
| `attractions`          | `{id,name}[]` | Sí            | `FormOrderedList`   |
| `destinations`         | `{id,name}[]` | No            | `FormTagManager`    |
| `checkboxOptions`      | `{id,name}[]` | No, pocos     | `FormCheckboxGroup` |

---

## Errores Comunes y Soluciones

### ❌ Error: "Property does not exist on type"

**Causa:** Olvidaste actualizar el type en `types.ts`

**Solución:** Añadir la propiedad al type correspondiente

---

### ❌ Error: Validación no funciona

**Causa:** El schema Zod no incluye el campo

**Solución:** Añadir la validación Zod al schema

---

### ❌ Error: El campo no se guarda

**Causa:** Olvidaste incluir el campo en el objeto de `api.*.update()`

**Solución:** Añadir el campo en la action donde se llama a la API

---

### ❌ Error: "Cannot read property of undefined"

**Causa:** El campo no está inicializado en `superForm()`

**Solución:** Añadir el campo con valor inicial (vacío o desde API)

---

### ❌ Error: Array de objetos - "availableItems is undefined"

**Causa:** Olvidaste cargar los items disponibles en el load function

**Solución:** Cargar con `Promise.all()` y retornar en data

```typescript
// ✅ CORRECTO
const [activity, availableDestinations] = await Promise.all([
	api.activities.getBySlug(fetch, params.slug),
	api.destinations.getAll(fetch) // ← Cargar opciones
]);

return {
	form,
	activity,
	availableDestinations: availableDestinations.data || [] // ← Retornar
};
```

---

### ❌ Error: Array de objetos - Items no se muestran

**Causa:** Props incorrectas en el componente

**Solución:** Verificar nombres de props

```svelte
<!-- ✅ FormTagManager usa 'tags' y 'availableTags' -->
<FormTagManager bind:tags={$form.destinations} availableTags={data.availableDestinations} />

<!-- ✅ FormOrderedList usa 'items' y 'availableItems' -->
<FormOrderedList bind:items={$form.attractions} availableItems={data.availableAttractions} />

<!-- ✅ FormCheckboxGroup usa 'items' y 'availableItems' -->
<FormCheckboxGroup bind:items={$form.categories} availableItems={data.availableCategories} />
```

---

### ❌ Error: Array de objetos - "key_title is not defined"

**Causa:** `FormCheckboxGroup` requiere especificar las keys del objeto

**Solución:** Añadir `key_title` y `key_value`

```svelte
<FormCheckboxGroup
  main_label="Categorías"
  id="categories"
  name="categories[]"
  key_title="name"     ← Propiedad para mostrar
  key_value="id"       ← Propiedad para el value
  bind:items={$form.categories}
  availableItems={data.availableCategories}
/>
```

---

### ❌ Error: "Cannot find module" al importar componente

**Causa:** Ruta de import incorrecta o componente no existe

**Solución:** Verificar imports

```svelte
// ✅ CORRECTO import FormTextList from '$lib/components/forms/FormTextList.svelte'; import
FormTagManager from '$lib/components/forms/FormTagManager.svelte'; import FormOrderedList from
'$lib/components/forms/FormOrderedList.svelte';
```

---

## Notas Importantes

- 🎯 **Siempre** usa los componentes de `$lib/components/forms/` - NO crees inputs HTML directos
- 🎯 **Siempre** usa `bind:value={$form.*}` y `error={$errors.*}`
- 🎯 **Siempre** valida en el servidor con Zod - la validación cliente es bonus
- 🎯 **Nunca** uses `export let` - usa `$props()` (Svelte 5)
- 🎯 **Nunca** uses `$:` para reactive - usa `$derived` (Svelte 5)

---

## Ejemplo Completo: Añadir Campo de Destinos

Caso real completo de principio a fin:

### 1. Type (types.ts)

```typescript
export type Activity = {
	id: string;
	title: string;
	destinations: Array<{ id: string; name: string }>; // ← Añadido
	// ... otros campos
};
```

### 2. Schema Zod (activity-form.schema.ts)

```typescript
export const activityFormSchema = z.object({
	id: z.string(),
	title: z.string(),
	destinations: z
		.array(
			z.object({
				id: z.string(),
				name: z.string()
			})
		)
		.default([]) // ← Añadido
	// ... otros campos
});
```

### 3. Data Handler (+page.server.ts)

```typescript
export const load: PageServerLoad = async ({ fetch, params }) => {
	// Cargar activity Y destinations disponibles
	const [activity, availableDestinations] = await Promise.all([
		api.activities.getBySlug(fetch, params.slug),
		api.destinations.getAll(fetch) // ← Cargar opciones
	]);

	const form = await superValidate(
		{
			id: activity.id,
			title: activity.title,
			destinations: activity.destinations || [] // ← Inicializar
			// ... otros campos
		},
		zod(activityFormSchema)
	);

	return {
		form,
		activity,
		availableDestinations: availableDestinations.data || [] // ← Retornar
	};
};

export const actions: Actions = {
	default: async ({ request, params, fetch }) => {
		const form = await superValidate(request, zod(activityFormSchema));

		if (!form.valid) return fail(400, { form });

		await api.activities.update(fetch, params.slug, {
			id: form.data.id,
			title: form.data.title,
			destinations: form.data.destinations // ← Enviar a API
			// ... otros campos
		});
	}
};
```

### 4. UI (+page.svelte)

```svelte
<script lang="ts">
	import FormTagManager from '$lib/components/forms/FormTagManager.svelte';

	let { data } = $props();
	const { form, errors, enhance } = superForm(data.form);
</script>

<form method="POST" use:enhance>
	<FormTagManager
		id="destinations"
		label="Destinos"
		bind:tags={$form.destinations}
		availableTags={data.availableDestinations}
		error={$errors.destinations?._errors}
		placeholder="Añade un destino..."
	/>
</form>
```

**✅ Resultado:** Campo completamente funcional que guarda relaciones con destinos.

---

## Referencias

- Ejemplos de formularios: `src/routes/(backoffice)/activities/[slug]/edit/`
- Componentes disponibles: Ver página `/components` en el navegador
- Documentación Zod: https://zod.dev/
- Documentación Superforms: https://superforms.rocks/
