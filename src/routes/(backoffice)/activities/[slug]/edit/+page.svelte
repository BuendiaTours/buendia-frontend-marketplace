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
		availableStatuses,
		availableKinds,
		availableGuideKinds
	} = data;

	const { form, errors, enhance, message } = superForm(data.form, {
		dataType: 'json'
	});
</script>

<div class="sticky top-0 z-10 flex items-center justify-between gap-4 bg-base-100 py-4">
	<a href={`/activities?${$page.url.searchParams.toString()}`} class="btn btn-ghost">
		← Volver al listado
	</a>
	<form
		method="POST"
		action={buildUrlWithFilters(`/activities/${activity.slug}/delete`, $page.url.searchParams)}
		class="ml-auto"
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
			Borrar
		</button>
	</form>
	<button form="edit-form" type="submit" class="btn btn-outline btn-primary">Guardar cambios</button
	>
</div>

<h1 class="">Editar Actividad</h1>

<form id="edit-form" method="POST" use:enhance class="space-y-4">
	<details
		class="collapse-arrow collapse border border-base-content/9 bg-base-100"
		name="my-accordion-det-1"
		open
	>
		<summary class="text-md collapse-title">Datos base</summary>
		<div class="collapse-content pl-64">
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
			</div>
		</div>
	</details>
	<div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-12">
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
			placeholder="Selecciona un destino..."
			emptyMessage="No hay destinos asociados"
			config={{ useDragAndDrop: true, showRemoveAll: true }}
			error={$errors.destinations?._errors}
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
			placeholder="Escribe un elemento necesario..."
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

		<FormSelect
			id="kind"
			label="Tipo de actividad"
			bind:value={$form.kind}
			error={$errors.kind}
			options={availableKinds}
			placeholder="Selecciona un tipo"
			wrapperClass="md:col-span-4"
		/>

		<FormSelect
			id="guideKind"
			label="Tipo de guía"
			bind:value={$form.guideKind}
			error={$errors.guideKind}
			options={availableGuideKinds}
			placeholder="Selecciona un tipo"
			wrapperClass="md:col-span-4"
		/>

		<div class="pt-o pt-7 md:col-span-3">
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
