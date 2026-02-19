<script lang="ts">
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import { ATTRACTION_ROUTES } from '$lib/config/routes/backoffice/attractions';

	// Enums
	import { ATTRACTION_STATUS_OPTIONS } from '$lib/labels/attractions';

	// Components
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	// Form components
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormGeoJson from '$lib/components/backoffice/forms/FormGeoJson.svelte';
	import FormInputSlug from '$lib/components/backoffice/forms/FormInputSlug.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormOrderedObjectList from '$lib/components/backoffice/forms/FormOrderedObjectList.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import FormTextarea from '$lib/components/backoffice/forms/FormTextarea.svelte';
	import FormTextareaMarkdown from '$lib/components/backoffice/forms/FormTextareaMarkdown.svelte';

	// Other componets
	import DebugApiJson from '$lib/components/backoffice/debug/DebugApiJson.svelte';

	// Icons
	import { Database } from '$lib/icons/Linear';

	let { data }: { data: PageData } = $props();

	const { form, errors, enhance } = superForm(data.form, {
		dataType: 'json'
	});
</script>

<LocationBar title="Editar Atracción" breadcrumbs={data.breadcrumbs} />

<div
	class="bnd-main-actions border-base-content/10 bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 border-t py-4"
>
	<a href={`${ATTRACTION_ROUTES.list}?${$page.url.searchParams.toString()}`} class="link">
		← Volver al listado
	</a>

	<form
		method="POST"
		action={buildUrlWithFilters(
			ATTRACTION_ROUTES.delete(data.attraction.slug),
			$page.url.searchParams
		)}
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
			Delete
		</button>
	</form>
	<button form="edit-form" type="submit" class="btn btn-outline btn-primary">Guardar cambios</button
	>
</div>

<form name="edit-form" method="POST" use:enhance class="space-y-4">
	<FormAccordion name="form-stages" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>Datos principales</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">Ayuda, descripcción... enlaces...</p>
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
				label="Descripcción larga"
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
				id="destintions"
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
				config={{
					showSearchBox: true
				}}
				error={$errors.location?._errors}
			/>
		{/snippet}
	</FormAccordion>
</form>

<DebugApiJson data={data.attraction} />
