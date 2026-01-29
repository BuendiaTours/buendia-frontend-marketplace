<script lang="ts">
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction } from '$lib/actions/confirmAction';

	// Form
	import FormCheckboxGroup from '$lib/components/forms/FormCheckboxGroup.svelte';
	import FormInputSlug from '$lib/components/forms/FormInputSlug.svelte';
	import FormInputText from '$lib/components/forms/FormInputText.svelte';
	import FormOrderedList from '$lib/components/forms/FormOrderedList.svelte';
	import FormSelect from '$lib/components/forms/FormSelect.svelte';
	import FormTagManager from '$lib/components/forms/FormTagManager.svelte';
	import FormTextarea from '$lib/components/forms/FormTextarea.svelte';
	import FormTextareaMarkdown from '$lib/components/forms/FormTextareaMarkdown.svelte';
	import FormTextList from '$lib/components/forms/FormTextList.svelte';

	let { data }: { data: PageData } = $props();
	const {
		activity,
		availableTags,
		availableCategories,
		availableAttractions,
		availableDistributives,
		availableStatuses
	} = data;

	const { form, errors, enhance, message } = superForm(data.form, {
		dataType: 'json'
	});
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
		<FormInputText
			id="id"
			label="Id"
			badge="read only"
			bind:value={$form.id}
			error={$errors.id}
			readonly
			wrapperClass="md:col-span-4"
		/>

		<FormInputText
			id="codeRef"
			label="codeRef"
			badge="disabled"
			bind:value={$form.codeRef}
			error={$errors.codeRef}
			disabled
			wrapperClass="md:col-span-4"
		/>

		<FormSelect
			id="status"
			label="Estado"
			bind:value={$form.status}
			error={$errors.status}
			options={availableStatuses}
			placeholder="Selecciona un estado"
			wrapperClass="md:col-span-4"
			selectClass={$form.status == 'APPROVED' ? 'border-2 border-success' : ''}
		/>

		<FormInputText
			id="title"
			label="Title"
			badge="read only"
			bind:value={$form.title}
			error={$errors.title}
			readonly
		/>

		<FormInputSlug
			id="slug"
			label="Slug"
			bind:value={$form.slug}
			sourceValue={$form.title}
			error={$errors.slug}
			generateTooltip="Genera slug a partir del título"
			wrapperClass="md:col-span-12"
		/>

		<FormOrderedList
			id="attractions"
			label="Atracciones"
			bind:items={$form.attractions}
			availableItems={availableAttractions}
			error={$errors.attractions?._errors}
			placeholder="Selecciona una atracción..."
			emptyMessage="No hay atracciones asociadas"
		/>

		<FormOrderedList
			id="destinations"
			label="Destinos"
			bind:items={$form.destinations}
			availableItems={data.availableDestinations}
			error={$errors.destinations?._errors}
			placeholder="Selecciona un destino..."
			emptyMessage="No hay destinos asociados"
		/>

		<FormOrderedList
			id="distributives"
			label="Páginas distributivas a las que pertenece"
			bind:items={$form.distributives}
			availableItems={availableDistributives}
			error={$errors.distributives?._errors}
			placeholder="Selecciona un distributiva..."
			emptyMessage="No hay distributivas asociadas"
		/>

		<FormCheckboxGroup
			main_label="Categorías"
			id="categories"
			name="categories[]"
			key_title="name"
			key_value="id"
			bind:items={$form.categories}
			availableItems={availableCategories}
			error={$errors.categories?._errors}
		/>

		<FormTagManager
			id="tags"
			label="Tags"
			bind:tags={$form.tags}
			{availableTags}
			error={$errors.tags?._errors}
		/>

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
			rows={3}
		/>

		<FormTextList
			id="included"
			label="Elementos incluidos"
			bind:items={$form.included}
			error={$errors.included?._errors}
			placeholder="Escribe un elemento incluido..."
			badge="opcional"
		/>

		<FormTextList
			id="itemsToBring"
			label="Elementos necesarios para la actividad"
			bind:items={$form.itemsToBring}
			error={$errors.itemsToBring?._errors}
			placeholder="Escribe un elemento necsario..."
			badge="opcional"
		/>

		<FormTextList
			id="excluded"
			label="Elementos excluidos"
			bind:items={$form.excluded}
			error={$errors.excluded?._errors}
			placeholder="Escribe un elemento a excluir..."
			badge="opcional"
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

		<FormInputText
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
