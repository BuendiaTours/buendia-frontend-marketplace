<script lang="ts">
	import type { ActivityDetail } from '$lib/types';
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction } from '$lib/actions/confirmAction';

	export let data: PageData;
	const { activity } = data;

	const { form, errors, enhance, message } = superForm(data.form);
</script>

<div class="mb-4 flex items-center justify-between">
	<a href={`/activities?${$page.url.searchParams.toString()}`} class="link">
		← Volver al listado
	</a>

	<form
		method="POST"
		action={buildUrlWithFilters(`/activities/${activity.slug}/delete`, $page.url.searchParams)}
	>
		<button
			type="submit"
			class="btn btn-soft btn-error"
			use:confirmAction={{
				title: 'Eliminar actividad',
				message: '¿Seguro que quieres eliminar esta actividad?',
				confirmText: 'Eliminar',
				cancelText: 'Cancelar',
				danger: true
			}}
		>
			Delete
		</button>
	</form>
</div>

<h1>Editar Actividad</h1>

<form method="POST" use:enhance class="max-w-2xl space-y-4">
	<div class="form-control">
		<label class="label" for="title">
			<span class="label-text">Título</span>
		</label>
		<input
			type="text"
			id="title"
			name="title"
			class="input-bordered input input-sm"
			class:input-error={$errors.title}
			bind:value={$form.title}
		/>
		{#if $errors.title}
			<label class="label">
				<span class="label-text-alt text-error">{$errors.title}</span>
			</label>
		{/if}
	</div>

	<div class="form-control">
		<label class="label" for="location">
			<span class="label-text">Ubicación</span>
		</label>
		<input
			type="text"
			id="location"
			name="location"
			class="input-bordered input input-sm"
			class:input-error={$errors.location}
			bind:value={$form.location}
		/>
		{#if $errors.location}
			<label class="label">
				<span class="label-text-alt text-error">{$errors.location}</span>
			</label>
		{/if}
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div class="form-control">
			<label class="label" for="priceFrom">
				<span class="label-text">Precio desde</span>
			</label>
			<input
				type="number"
				id="priceFrom"
				name="priceFrom"
				class="input-bordered input input-sm"
				class:input-error={$errors.priceFrom}
				bind:value={$form.priceFrom}
				min="0"
				step="0.01"
			/>
			{#if $errors.priceFrom}
				<label class="label">
					<span class="label-text-alt text-error">{$errors.priceFrom}</span>
				</label>
			{/if}
		</div>

		<div class="form-control">
			<label class="label" for="currency">
				<span class="label-text">Moneda</span>
			</label>
			<select
				id="currency"
				name="currency"
				class="select-bordered select select-sm"
				class:select-error={$errors.currency}
				bind:value={$form.currency}
			>
				<option value="EUR">EUR</option>
				<option value="USD">USD</option>
				<option value="GBP">GBP</option>
			</select>
			{#if $errors.currency}
				<label class="label">
					<span class="label-text-alt text-error">{$errors.currency}</span>
				</label>
			{/if}
		</div>
	</div>

	<div class="form-control">
		<label class="label cursor-pointer justify-start gap-2">
			<input
				type="checkbox"
				name="isFreeTour"
				class="checkbox checkbox-sm"
				bind:checked={$form.isFreeTour}
			/>
			<span class="label-text">Es Free Tour</span>
		</label>
	</div>

	<div class="flex gap-2">
		<button type="submit" class="btn btn-sm btn-primary">Guardar cambios</button>
		<a href={`/activities/${activity.slug}`} class="btn btn-ghost btn-sm">Cancelar</a>
	</div>
</form>

<h2 class="mt-8">JSON de la API</h2>
<pre class="overflow-x-auto rounded-box bg-base-200 p-4 text-xs">{JSON.stringify(
		activity,
		null,
		2
	)}</pre>
