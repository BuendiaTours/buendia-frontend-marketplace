<script lang="ts">
	import type { ActivityDetail } from '$lib/types';
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction } from '$lib/actions/confirmAction';
	import { slugify } from '$lib/utils/strings';
	import { Refresh } from 'svelte-iconoir';

	export let data: PageData;
	const { activity } = data;

	const { form, errors, enhance, message } = superForm(data.form);

	function generateSlug() {
		if ($form.title) {
			$form.slug = slugify($form.title);
		}
	}
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
	<div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-12">
		<div class="md:col-span-9">
			<label class="label text-sm" for="title">Id</label>
			<input
				type="text"
				id="id"
				name="id"
				class="input w-full"
				class:input-error={$errors.id}
				bind:value={$form.id}
				readonly
			/>
			{#if $errors.id}
				<span class="label-text-alt text-error">{$errors.id}</span>
			{/if}
		</div>

		<div class="md:col-span-3">
			<label class="label text-sm" for="title">CodeRef.</label>
			<input
				type="text"
				id="codeRef"
				name="codeRef"
				class="input w-full"
				class:input-error={$errors.codeRef}
				bind:value={$form.codeRef}
				readonly
			/>
			{#if $errors.codeRef}
				<span class="label-text-alt text-error">{$errors.codeRef}</span>
			{/if}
		</div>

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
			<label class="label text-sm" for="slug">Slug</label>
			<div class="flex gap-2">
				<input
					type="text"
					id="slug"
					name="slug"
					class="input w-full"
					class:input-error={$errors.slug}
					bind:value={$form.slug}
				/>

				<div class="tooltip" data-tip="Genera slug a partir del título">
					<button type="button" class="btn btn-square btn-soft" onclick={generateSlug}>
						<Refresh />
					</button>
				</div>
			</div>
			{#if $errors.slug}
				<span class="text-sm text-error">{$errors.slug}</span>
			{/if}
		</div>

		<div class="md:col-span-12">
			<label class="label text-sm" for="descriptionShort">Descripcción corta</label>
			<input
				type="text"
				id="descriptionShort"
				name="descriptionShort"
				class="input w-full"
				class:input-error={$errors.descriptionShort}
				bind:value={$form.descriptionShort}
			/>
			{#if $errors.descriptionShort}
				<span class="label-text-alt text-error">{$errors.descriptionShort}</span>
			{/if}
		</div>

		<div class="md:col-span-12">
			<label class="label text-sm" for="descriptionFull">Descripcción larga</label>
			<textarea
				id="descriptionFull"
				name="descriptionFull"
				class="textarea min-h-48 w-full"
				class:input-error={$errors.descriptionFull}
				bind:value={$form.descriptionFull}
			></textarea>
			{#if $errors.descriptionFull}
				<span class="label-text-alt text-error">{$errors.descriptionFull}</span>
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
