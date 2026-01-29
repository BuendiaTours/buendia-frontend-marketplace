# Code Examples

Esta guía contiene ejemplos completos de código siguiendo las convenciones del proyecto.

## 📚 Índice

1. [Páginas CRUD](#páginas-crud)
2. [Formularios](#formularios)
3. [API Integration](#api-integration)
4. [Componentes](#componentes)
5. [Patrones Comunes](#patrones-comunes)

---

## Páginas CRUD

### Página de Listado

**Ejemplo de referencia:** `src/routes/(backoffice)/activities/+page.server.ts`

```typescript
// +page.server.ts
import { api, ApiError } from '$lib/api/index';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	// Obtener parámetros de URL
	const page = Number(url.searchParams.get('page')) || 1;
	const pageSize = Number(url.searchParams.get('pageSize')) || 20;
	const status = url.searchParams.get('status') || undefined;

	try {
		const response = await api.activities.getAll(fetch, {
			page,
			pageSize,
			status
		});

		return {
			activities: response.data,
			pagination: response.pagination
		};
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500, err.message);
		}
		throw error(500, 'Error al cargar actividades');
	}
};
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto">
	<h1 class="mb-4 text-2xl font-bold">Actividades</h1>

	<div class="overflow-x-auto">
		<table class="table">
			<thead>
				<tr>
					<th>Título</th>
					<th>Estado</th>
					<th>Precio</th>
					<th>Acciones</th>
				</tr>
			</thead>
			<tbody>
				{#each data.activities as activity}
					<tr>
						<td>{activity.title}</td>
						<td>{activity.status}</td>
						<td>{activity.priceFrom} {activity.currency}</td>
						<td>
							<a href="/activities/{activity.slug}" class="btn btn-sm"> Ver </a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
```

---

### Página de Detalle

**Ejemplo de referencia:** `src/routes/(backoffice)/activities/[slug]/+page.server.ts`

```typescript
// +page.server.ts
import { api, ApiError } from '$lib/api/index';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const activity = await api.activities.getBySlug(fetch, params.slug);

		return { activity };
	} catch (err) {
		if (err instanceof ApiError) {
			if (err.type === 'not_found') {
				throw error(404, 'Actividad no encontrada');
			}
			throw error(err.status || 500, err.message);
		}
		throw error(500, 'Error al cargar actividad');
	}
};
```

---

### Página de Edición

**Ejemplo de referencia:** `src/routes/(backoffice)/activities/[slug]/edit/+page.server.ts`

```typescript
// +page.server.ts
import { api, ApiError } from '$lib/api/index';
import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { activityEditSchema } from '$lib/schemas/activity.schema';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const activity = await api.activities.getBySlug(fetch, params.slug);

		const form = await superValidate(
			{
				id: activity.id,
				title: activity.title,
				slug: activity.slug,
				descriptionShort: activity.descriptionShort,
				priceFrom: activity.priceFrom,
				currency: activity.currency
			},
			zod(activityEditSchema)
		);

		return { form, activity };
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500, err.message);
		}
		throw error(500, 'Error al cargar actividad');
	}
};

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
				priceFrom: form.data.priceFrom,
				currency: form.data.currency
			});

			throw redirect(303, `/activities/${form.data.slug}`);
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status || 500, {
					form,
					error: err.message
				});
			}
			return fail(500, { form, error: 'Error al actualizar' });
		}
	}
};
```

---

## Formularios

### Schema de Validación Zod

**Ejemplo de referencia:** `src/lib/schemas/activity.schema.ts`

```typescript
import { z } from 'zod';

export const activityEditSchema = z.object({
	id: z.string(),

	title: z.string().min(1, 'El título es requerido').max(200, 'Máximo 200 caracteres'),

	slug: z
		.string()
		.min(1, 'El slug es requerido')
		.regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),

	descriptionShort: z.string().max(500, 'Máximo 500 caracteres').optional(),

	priceFrom: z
		.number({ invalid_type_error: 'Debe ser un número' })
		.positive('Debe ser mayor a 0')
		.optional(),

	currency: z.enum(['EUR', 'USD', 'GBP']).default('EUR'),

	isFreeTour: z.boolean().default(false),

	status: z.enum(['ACTIVE', 'DRAFT', 'INACTIVE'])
});

export type ActivityEdit = z.infer<typeof activityEditSchema>;
```

### Formulario Completo

**Ejemplo de referencia:** `src/routes/(backoffice)/activities/[slug]/edit/+page.svelte`

```svelte
<script lang="ts">
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import FormInputText from '$lib/components/forms/FormInputText.svelte';
	import FormTextarea from '$lib/components/forms/FormTextarea.svelte';
	import FormSelect from '$lib/components/forms/FormSelect.svelte';

	let { data }: { data: PageData } = $props();

	const { form, errors, enhance, message } = superForm(data.form, {
		dataType: 'json'
	});
</script>

<h1>Editar Actividad</h1>

<form method="POST" use:enhance class="max-w-2xl space-y-4">
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<FormInputText
			id="title"
			label="Título"
			bind:value={$form.title}
			error={$errors.title}
			wrapperClass="md:col-span-2"
		/>

		<FormInputText id="slug" label="Slug" bind:value={$form.slug} error={$errors.slug} />

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
		/>

		<FormTextarea
			id="descriptionShort"
			label="Descripción corta"
			bind:value={$form.descriptionShort}
			error={$errors.descriptionShort}
			rows={3}
			wrapperClass="md:col-span-2"
		/>

		<FormInputText
			id="priceFrom"
			label="Precio desde"
			type="number"
			bind:value={$form.priceFrom}
			error={$errors.priceFrom}
			min="0"
			step="0.01"
		/>

		<FormSelect
			id="currency"
			label="Moneda"
			bind:value={$form.currency}
			error={$errors.currency}
			options={[
				{ id: 'EUR', name: 'EUR' },
				{ id: 'USD', name: 'USD' },
				{ id: 'GBP', name: 'GBP' }
			]}
		/>
	</div>

	<div class="flex justify-between">
		<a href="/activities/{data.activity.slug}" class="btn btn-ghost"> Cancelar </a>
		<button type="submit" class="btn btn-primary"> Guardar </button>
	</div>
</form>
```

---

## API Integration

### Definir Endpoint

**Archivo:** `src/lib/api/endpoints-metadata.ts`

```typescript
export const API_ENDPOINTS = {
	bookings: {
		groupName: 'Bookings',
		groupDescription: 'Gestión de reservas',

		list: {
			path: () => BASE_PATHS.bookings,
			method: 'GET',
			description: 'Obtiene listado de reservas con paginación',
			params: ['page', 'limit', 'status']
		},

		detail: {
			path: (id: string) => `${BASE_PATHS.bookings}/${id}`,
			method: 'GET',
			description: 'Obtiene detalles de una reserva',
			params: ['id']
		},

		create: {
			path: () => BASE_PATHS.bookings,
			method: 'POST',
			description: 'Crea una nueva reserva',
			params: ['body']
		}
	}
} as const;
```

### Implementar Métodos

**Archivo:** `src/lib/api/endpoints/bookings.ts`

```typescript
import { apiClient } from '../client';
import { API_ENDPOINTS, buildEndpointUrl } from '../endpoints-metadata';

export type Booking = {
	id: string;
	activityId: string;
	userId: string;
	date: string;
	status: 'pending' | 'confirmed' | 'cancelled';
};

export type BookingsGetAllParams = {
	page?: number;
	pageSize?: number;
	status?: string;
};

export const bookingsEndpoints = {
	async getAll(fetchFn: typeof fetch, params?: BookingsGetAllParams): Promise<Booking[]> {
		const path = buildEndpointUrl(API_ENDPOINTS.bookings.list.path(), params);

		const response = await apiClient.request<Booking[]>(fetchFn, path, { method: 'GET' });

		return response.data;
	},

	async getById(fetchFn: typeof fetch, id: string): Promise<Booking> {
		const path = API_ENDPOINTS.bookings.detail.path(id);

		const response = await apiClient.request<Booking>(fetchFn, path, { method: 'GET' });

		return response.data;
	},

	async create(fetchFn: typeof fetch, data: Partial<Booking>): Promise<Booking> {
		const path = API_ENDPOINTS.bookings.create.path();

		const response = await apiClient.request<Booking>(fetchFn, path, {
			method: 'POST',
			body: JSON.stringify(data)
		});

		return response.data;
	}
};
```

---

## Componentes

### Componente de Formulario

**Ejemplo de referencia:** `src/lib/components/forms/FormInputText.svelte`

```svelte
<script lang="ts">
	import FormErrorMsg from './FormErrorMsg.svelte';

	interface Props {
		id: string;
		label: string;
		value: string | number;
		error?: string | string[];
		type?: string;
		placeholder?: string;
		readonly?: boolean;
		disabled?: boolean;
		wrapperClass?: string;
		[key: string]: any;
	}

	let {
		id,
		label,
		value = $bindable(),
		error,
		type = 'text',
		placeholder,
		readonly = false,
		disabled = false,
		wrapperClass = 'md:col-span-12',
		...restProps
	}: Props = $props();
</script>

<div class={wrapperClass}>
	<label class="label text-sm" for={id}>
		<span>{label}</span>
	</label>
	<input
		{type}
		{id}
		name={id}
		class="input w-full"
		class:input-error={error}
		bind:value
		{placeholder}
		{readonly}
		{disabled}
		{...restProps}
	/>
	<FormErrorMsg {error} />
</div>
```

### Componente UI

**Ejemplo de referencia:** `src/lib/components/StarRating.svelte`

```svelte
<script lang="ts">
	interface Props {
		value: number | null;
		size?: 'xs' | 'sm' | 'md' | 'lg';
		filledClass?: string;
		emptyClass?: string;
	}

	let { value, size = 'xs', filledClass = '', emptyClass = '' }: Props = $props();

	const roundedRating = $derived(() => {
		if (value === null) return 0;
		return Math.round(value * 2) / 2;
	});

	const stars = $derived(() => {
		const rating = roundedRating();
		const result: ('full' | 'half' | 'empty')[] = [];

		for (let i = 1; i <= 5; i++) {
			if (rating >= i) {
				result.push('full');
			} else if (rating >= i - 0.5) {
				result.push('half');
			} else {
				result.push('empty');
			}
		}

		return result;
	});
</script>

{#if value !== null}
	<div class="rating rating-half">
		{#each stars() as star}
			{#if star === 'full'}
				<div class="mask mask-star-2 {filledClass}"></div>
			{:else if star === 'half'}
				<div class="mask mask-star-2 mask-half-1 {filledClass}"></div>
				<div class="mask mask-star-2 mask-half-2 {emptyClass}"></div>
			{:else}
				<div class="mask mask-star-2 {emptyClass}"></div>
			{/if}
		{/each}
	</div>
{:else}
	<span>—</span>
{/if}
```

---

## Patrones Comunes

### Manejo de Errores

```typescript
try {
	const data = await api.resource.method(fetch, params);
	return { data };
} catch (err) {
	if (err instanceof ApiError) {
		// Error específico de la API
		if (err.type === 'not_found') {
			throw error(404, 'Recurso no encontrado');
		}
		if (err.type === 'unauthorized') {
			throw error(401, 'No autorizado');
		}
		throw error(err.status || 500, err.message);
	}
	// Error inesperado
	throw error(500, 'Error inesperado');
}
```

### Paginación

```typescript
// +page.server.ts
export const load: PageServerLoad = async ({ fetch, url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const pageSize = Number(url.searchParams.get('pageSize')) || 20;

	const response = await api.resource.getAll(fetch, { page, pageSize });

	return {
		items: response.data,
		pagination: response.pagination
	};
};
```

```svelte
<!-- +page.svelte -->
<div class="flex justify-between">
	<a
		href="?page={data.pagination.page - 1}"
		class="btn"
		class:btn-disabled={data.pagination.page === 1}
	>
		Anterior
	</a>
	<span>Página {data.pagination.page} de {data.pagination.totalPages}</span>
	<a
		href="?page={data.pagination.page + 1}"
		class="btn"
		class:btn-disabled={data.pagination.page === data.pagination.totalPages}
	>
		Siguiente
	</a>
</div>
```

### Confirmación de Acciones

```svelte
<script>
	import { confirmAction } from '$lib/actions/confirmAction';
</script>

<form method="POST" action="/resource/{id}/delete">
	<button
		type="submit"
		class="btn btn-error"
		use:confirmAction={{
			title: 'Eliminar recurso',
			message: '¿Estás seguro?',
			confirmText: 'Eliminar',
			cancelText: 'Cancelar',
			danger: true
		}}
	>
		Eliminar
	</button>
</form>
```

### Loading States

```svelte
<script lang="ts">
	import { enhance } from '$app/forms';

	let loading = $state(false);
</script>

<form
	method="POST"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			await update();
			loading = false;
		};
	}}
>
	<button type="submit" class="btn" disabled={loading}>
		{#if loading}
			<span class="loading loading-spinner"></span>
			Guardando...
		{:else}
			Guardar
		{/if}
	</button>
</form>
```

---

## Referencias

- **Página de componentes:** `/components` (navegador)
- **Catálogo de API:** `/api-catalog` (navegador)
- **Skills:** `.github/copilot/skills/`
- **Documentación API:** `docs/api.md`
- **Context para AI:** `AI.md`
