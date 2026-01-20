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

<!-- <form class="max-w-4xl space-y-6">
	<div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-12">
		<div class="md:col-span-6">
			<label class="mb-1 block text-sm font-medium"> Nombre </label>
			<input type="text" class="w-full rounded border px-3 py-2" placeholder="Juan" />
		</div>

		<div class="md:col-span-6">
			<label class="mb-1 block text-sm font-medium"> Apellidos </label>
			<input type="text" class="w-full rounded border px-3 py-2" placeholder="Pérez García" />
		</div>

		<div class="md:col-span-12">
			<label class="mb-1 block text-sm font-medium"> Email </label>
			<input type="email" class="w-full rounded border px-3 py-2" placeholder="email@ejemplo.com" />
		</div>

		<div class="md:col-span-3">
			<label class="mb-1 block text-sm font-medium"> Código postal </label>
			<input type="text" class="w-full rounded border px-3 py-2" placeholder="28001" />
		</div>

		<div class="md:col-span-5">
			<label class="mb-1 block text-sm font-medium"> Ciudad </label>
			<input type="text" class="w-full rounded border px-3 py-2" placeholder="Madrid" />
		</div>

		<div class="md:col-span-4">
			<label class="mb-1 block text-sm font-medium"> Provincia </label>
			<select class="w-full rounded border px-3 py-2">
				<option>Madrid</option>
				<option>Barcelona</option>
				<option>Valencia</option>
			</select>
		</div>

		<div class="md:col-span-12">
			<label class="mb-1 block text-sm font-medium"> Observaciones </label>
			<textarea class="w-full rounded border px-3 py-2" rows="3" placeholder="Notas adicionales..."
			></textarea>
		</div>
	</div>

	<div class="flex justify-end gap-3">
		<button type="button" class="rounded border px-4 py-2"> Cancelar </button>
		<button type="submit" class="rounded bg-blue-600 px-4 py-2 text-white"> Guardar </button>
	</div>
</form>
-->

<form method="POST" use:enhance class="max-w-2xl space-y-4">
	<div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-12">
		<div class="md:col-span-12">
			<label class="label text-sm" for="title">Título</label>
			<input
				type="text"
				id="title"
				name="title"
				class="input w-full"
				class:input-error={$errors.title}
				bind:value={$form.title}
			/>
			{#if $errors.title}
				<span class="label-text-alt text-error">{$errors.title}</span>
			{/if}
		</div>

		<div class="md:col-span-12">
			<label class="label text-sm" for="title">Slug</label>
			<input
				type="text"
				id="slug"
				name="slug"
				class="input w-full"
				class:input-error={$errors.title}
				bind:value={$form.title}
			/>
			{#if $errors.title}
				<span class="text-sm text-error">{$errors.title}</span>
			{/if}
		</div>

		<div class="md:col-span-6">
			<label class="label text-sm" for="location">Ubicación </label>
			<input
				type="text"
				id="location"
				name="location"
				class="input w-full"
				class:input-error={$errors.location}
				bind:value={$form.location}
			/>
			{#if $errors.location}
				<span class="text-sm text-error">{$errors.location}</span>
			{/if}
		</div>

		<div class="md:col-span-3">
			<label class="label text-sm" for="priceFrom">Precio desde</label>
			<input
				type="number"
				id="priceFrom"
				name="priceFrom"
				class="input w-full"
				class:input-error={$errors.priceFrom}
				bind:value={$form.priceFrom}
				min="0"
				step="0.01"
			/>
			{#if $errors.priceFrom}
				<span class="text-sm text-error">{$errors.priceFrom}</span>
			{/if}
		</div>

		<div class="md:col-span-3">
			<label class="label text-sm" for="currency">Moneda</label>
			<select
				id="currency"
				name="currency"
				class="select w-full"
				class:select-error={$errors.currency}
				bind:value={$form.currency}
			>
				<option value="EUR">EUR</option>
				<option value="USD">USD</option>
				<option value="GBP">GBP</option>
			</select>
			{#if $errors.currency}
				<span class="text-sm text-error">{$errors.currency}</span>
			{/if}
		</div>

		<div class="md:col-span-3">
			<label class="label w-full cursor-pointer text-sm">
				<input type="checkbox" name="isFreeTour" class="checkbox" bind:checked={$form.isFreeTour} />
				<span class="label-text">Es Free Tour</span>
			</label>
		</div>

		<div class="md:col-span-9">Otro contenido</div>
	</div>

	<div class="flex justify-between">
		<a href={`/activities/${activity.slug}`} class="btn btn-soft btn-error">Cancelar</a>
		<button type="submit" class="btn btn-outline btn-primary">Guardar cambios</button>
	</div>
</form>

<h2 class="mt-8">JSON de la API</h2>
<pre class="overflow-x-auto rounded-box bg-base-200 p-4 text-xs">{JSON.stringify(
		activity,
		null,
		2
	)}</pre>
