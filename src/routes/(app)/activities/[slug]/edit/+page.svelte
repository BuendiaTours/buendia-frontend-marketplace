<script lang="ts">
	import type { ActivityDetail } from '$lib/types';
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction } from '$lib/actions/confirmAction';
	import { slugify } from '$lib/utils/strings';
	import { Plus, Refresh } from 'svelte-iconoir';
	import FormTextInput from '$lib/components/form/FormTextInput.svelte';
	import FormErrorMsg from '$lib/components/form/FormErrorMsg.svelte';
	import FormTextarea from '$lib/components/form/FormTextarea.svelte';
	import FormTextareaMarkdown from '$lib/components/form/FormTextareaMarkdown.svelte';
	import FormTagManager from '$lib/components/form/FormTagManager.svelte';
	import FormCategoryCheckboxes from '$lib/components/form/FormCategoryCheckboxes.svelte';

	let { data }: { data: PageData } = $props();
	const { activity, availableTags, availableCategories } = data;

	const { form, errors, enhance, message } = superForm(data.form, {
		dataType: 'json'
	});

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
		<FormTextInput
			id="id"
			label="Id"
			badge="read only"
			bind:value={$form.id}
			error={$errors.id}
			readonly
			wrapperClass="md:col-span-9"
		/>

		<FormTextInput
			id="codeRef"
			label="codeRef"
			badge="disabled"
			bind:value={$form.codeRef}
			error={$errors.codeRef}
			disabled
			wrapperClass="md:col-span-3"
		/>

		<FormTextInput
			id="title"
			label="Title"
			badge="read only"
			bind:value={$form.title}
			error={$errors.title}
			readonly
		/>

		<FormCategoryCheckboxes
			id="categories"
			label="Categorías"
			bind:categories={$form.categories}
			{availableCategories}
			error={$errors.categories?._errors}
		/>

		<FormTagManager
			id="tags"
			label="Tags"
			bind:tags={$form.tags}
			{availableTags}
			error={$errors.tags?._errors}
		/>

		<div class="md:col-span-12">
			<label class="label text-sm" for="slug"><span>Slug</span></label>
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
			<FormErrorMsg error={$errors.slug} />
		</div>

		<FormTextareaMarkdown
			id="descriptionFull"
			label="Descripcción larga"
			bind:value={$form.descriptionFull}
			error={$errors.descriptionFull}
		/>

		<FormTextarea
			id="infoImportant"
			label="Información importante"
			bind:value={$form.infoImportant}
			error={$errors.infoImportant}
			rows="3"
		/>

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

		<FormTextInput
			id="priceFrom"
			label="Precio desde"
			type="number"
			bind:value={$form.priceFrom}
			error={$errors.priceFrom}
			min="0"
			step="0.01"
			wrapperClass="md:col-span-3"
		/>

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
