<script lang="ts">
	/**
	 * LocationForm - Componente reutilizable para crear y editar ubicaciones
	 */
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import { LOCATION_KIND_OPTIONS } from '$lib/labels/locations';
	import { LOCATION_ROUTES } from '$lib/config/routes/backoffice/locations';
	import type { Location } from '$lib/types';

	import { Database } from '$lib/icons/Linear';
	import DebugApiJson from '$lib/components/backoffice/debug/DebugApiJson.svelte';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputSlug from '$lib/components/backoffice/forms/FormInputSlug.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import FormTextarea from '$lib/components/backoffice/forms/FormTextarea.svelte';

	type Props = {
		data: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			form: any;
			location?: Location;
		};
		mode: 'create' | 'edit';
		locationSlug?: string;
	};

	let { data, mode, locationSlug }: Props = $props();

	const isCreateMode = $derived(mode === 'create');
	const isEditMode = $derived(mode === 'edit');
	const location = $derived(isEditMode ? data.location : null);

	const { form, errors, enhance } = superForm(data.form, {
		dataType: 'json'
	});
</script>

<div
	class="bnd-main-actions border-base-content/10 bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 border-t py-4"
>
	<a href={`${LOCATION_ROUTES.list}?${$page.url.searchParams.toString()}`} class="btn btn-ghost">
		← Volver al listado
	</a>

	{#if isEditMode && locationSlug}
		<form
			method="POST"
			action={buildUrlWithFilters(LOCATION_ROUTES.delete(locationSlug), $page.url.searchParams)}
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
		form="location-form"
		type="submit"
		class="btn btn-outline btn-primary"
		class:ml-auto={isCreateMode}
	>
		{isCreateMode ? 'Crear ubicación' : 'Guardar cambios'}
	</button>
</div>

<form id="location-form" method="POST" use:enhance class="space-y-4">
	<FormAccordion name="form-location-data" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>Datos principales</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">Información principal de la ubicación</p>
		{/snippet}
		{#snippet content()}
			<FormInputText
				id="id"
				label="Id"
				badge="read only"
				bind:value={$form.id}
				error={$errors.id}
				readonly
				wrapperClass="md:col-span-12"
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

			<FormSelect
				id="kind"
				label="Tipo"
				bind:value={$form.kind}
				error={$errors.kind}
				options={LOCATION_KIND_OPTIONS}
				placeholder="Selecciona un tipo"
				wrapperClass="md:col-span-12"
			/>

			<FormTextarea
				id="descriptionShort"
				label="Descripción corta"
				bind:value={$form.descriptionShort}
				error={$errors.descriptionShort}
				rows={3}
				wrapperClass="md:col-span-12"
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
				id="photoUrlHero"
				label="URL de imagen principal"
				type="url"
				bind:value={$form.photoUrlHero}
				error={$errors.photoUrlHero}
				wrapperClass="md:col-span-8"
				placeholder="https://example.com/image.jpg"
			/>
		{/snippet}
	</FormAccordion>
</form>

<DebugApiJson data={isEditMode ? location : $form} />
