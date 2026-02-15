<script lang="ts">
	/**
	 * AttractionForm - Componente reutilizable para crear y editar atracciones
	 */
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import { ATTRACTION_STATUS_OPTIONS } from '$lib/labels/attractions';
	import { DatabaseRestore } from 'svelte-iconoir';
	import type { Attraction } from '$lib/types';

	// Components
	import DebugApiJson from '$lib/components/backoffice/debug/DebugApiJson.svelte';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormGeoJson from '$lib/components/backoffice/forms/FormGeoJson.svelte';
	import FormInputSlug from '$lib/components/backoffice/forms/FormInputSlug.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormOrderedObjectList from '$lib/components/backoffice/forms/FormOrderedObjectList.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import FormTextarea from '$lib/components/backoffice/forms/FormTextarea.svelte';
	import FormTextareaMarkdown from '$lib/components/backoffice/forms/FormTextareaMarkdown.svelte';

	type Props = {
		data: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Superforms SuperValidated generic is complex with multiple type params
			form: any;
			availableDestinations: Array<{ id: string; name: string }>;
			attraction?: Attraction;
		};
		mode: 'create' | 'edit';
		attractionSlug?: string;
	};

	let { data, mode, attractionSlug }: Props = $props();

	const isCreateMode = $derived(mode === 'create');
	const isEditMode = $derived(mode === 'edit');
	const attraction = $derived(isEditMode ? data.attraction : null);

	const { form, errors, enhance } = superForm(data.form, {
		dataType: 'json'
	});
</script>

<div
	class="bnd-main-actions border-base-content/10 bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 border-t py-4"
>
	<a href={`/backoffice/attractions?${$page.url.searchParams.toString()}`} class="btn btn-ghost">
		← Volver al listado
	</a>

	{#if isEditMode && attractionSlug}
		<form
			method="POST"
			action={buildUrlWithFilters(`/attractions/${attractionSlug}/delete`, $page.url.searchParams)}
			class="ml-auto"
		>
			<button
				type="submit"
				class="btn btn-soft btn-error"
				use:confirmAction={{
					title: 'Eliminar elemento',
					message: '¿Estás seguro de que quieres eliminar este elemento?',
					confirmText: 'Eliminar',
					cancelText: 'Cancelar',
					danger: true
				}}
			>
				Borrar
			</button>
		</form>
	{/if}

	<button
		form="attraction-form"
		type="submit"
		class="btn btn-outline btn-primary"
		class:ml-auto={isCreateMode}
	>
		{isCreateMode ? 'Crear atracción' : 'Guardar cambios'}
	</button>
</div>

<form id="attraction-form" method="POST" use:enhance class="space-y-4">
	<FormAccordion name="form-attraction-data" open>
		{#snippet title()}
			<DatabaseRestore class="size-6" />
			<span>Datos principales</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">Información principal de la atracción</p>
		{/snippet}
		{#snippet content()}
			<FormInputText
				id="id"
				label="Id"
				badge="read only"
				bind:value={$form.id}
				error={$errors.id}
				readonly
				wrapperClass="md:col-span-8"
			/>

			<FormSelect
				id="status"
				label="Estado"
				bind:value={$form.status}
				error={$errors.status}
				options={ATTRACTION_STATUS_OPTIONS}
				placeholder="Selecciona un estado"
				wrapperClass="md:col-span-4"
			/>

			<FormInputText
				id="name"
				label="Nombre"
				bind:value={$form.name}
				error={$errors.name}
				readonly={isEditMode}
				badge={isEditMode ? 'read only' : undefined}
				wrapperClass="md:col-span-12"
			/>

			<FormInputSlug
				id="slug"
				label="Slug"
				bind:value={$form.slug}
				sourceValue={$form.name}
				error={$errors.slug}
				generateTooltip="Genera slug a partir del nombre"
				wrapperClass="md:col-span-12"
			/>

			<FormTextarea
				id="description"
				label="Descripción corta"
				bind:value={$form.description}
				error={$errors.description}
				rows={3}
				wrapperClass="md:col-span-12"
			/>

			<FormTextareaMarkdown
				id="descriptionLong"
				label="Descripción larga"
				bind:value={$form.descriptionLong}
				error={$errors.descriptionLong}
			/>

			<div class="md:col-span-4">
				<div class="card p-4">
					{#if $form.photoUrl}
						<a href={$form.photoUrl} target="_blank" rel="noopener noreferrer">
							<img src={$form.photoUrl} alt="" />
						</a>
					{/if}
				</div>
			</div>

			<FormInputText
				id="photoUrlHero"
				label="URL de imagen principal (Hero)"
				type="url"
				bind:value={$form.photoUrlHero}
				error={$errors.photoUrlHero}
				wrapperClass="md:col-span-8"
				placeholder="https://example.com/image.jpg"
			/>

			<div class="md:col-span-4">
				<div class="card p-4">
					{#if $form.photoUrlHero}
						<a href={$form.photoUrlHero} target="_blank" rel="noopener noreferrer">
							<img src={$form.photoUrlHero} alt="" />
						</a>
					{/if}
				</div>
			</div>

			<FormInputText
				id="photoUrl"
				label="URL de imagen secundaria"
				type="url"
				bind:value={$form.photoUrl}
				error={$errors.photoUrl}
				wrapperClass="md:col-span-8"
				placeholder="https://example.com/image.jpg"
			/>

			<FormOrderedObjectList
				id="destinations"
				label="Destinos"
				bind:items={$form.destinations}
				availableItems={data.availableDestinations}
				error={$errors.destinations?._errors}
				placeholder="Selecciona un destino..."
				emptyMessage="No hay destinos asociados"
			/>

			<FormTextarea
				id="postalAddress"
				label="Dirección postal"
				bind:value={$form.postalAddress}
				error={$errors.postalAddress}
				rows={2}
				wrapperClass="md:col-span-12"
			/>

			<FormGeoJson
				id="location"
				label="Ubicación"
				bind:value={$form.location}
				mapClass="h-[450px]"
				config={{ showSearchBox: true }}
				error={$errors.location?._errors}
			/>
		{/snippet}
	</FormAccordion>
</form>

<DebugApiJson data={isEditMode ? attraction : $form} />
