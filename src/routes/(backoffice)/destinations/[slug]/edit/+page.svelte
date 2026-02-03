<script lang="ts">
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction } from '$lib/actions/confirmAction';
	import { page } from '$app/stores';
	import { slugify } from '$lib/utils/strings';
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';

	// Enums
	import { DESTINATION_KIND_OPTIONS } from '$lib/config/enums';

	// Form components
	import FormInputText from '$lib/components/forms/FormInputText.svelte';
	import FormTextarea from '$lib/components/forms/FormTextarea.svelte';
	import FormAccordion from '$lib/components/forms/layout/FormAccordion.svelte';
	import FormInputSlug from '$lib/components/forms/FormInputSlug.svelte';
	import FormSelect from '$lib/components/forms/FormSelect.svelte';

	// Components
	import LocationBar from '$lib/layout/partials/LocationBar.svelte';

	// Icons
	import { DatabaseRestore } from 'svelte-iconoir';
	import DebugApiJson from '$lib/components/debug/DebugApiJson.svelte';

	let { data }: { data: PageData } = $props();
	const { destination, breadcrumbs } = data;

	const { form, errors, enhance, message } = superForm(data.form, {
		dataType: 'json'
	});

	function generateSlug() {
		if ($form.name) {
			$form.slug = slugify($form.name);
		}
	}
</script>

<LocationBar title="Editar destino" {breadcrumbs} />

<div
	class="bnd-main-actions sticky top-0 z-10 flex items-center justify-between gap-4 border-t border-base-content/10 bg-base-100 py-4"
>
	<a href={`/destinations?${$page.url.searchParams.toString()}`} class="link">
		← Volver al listado
	</a>

	<form
		method="POST"
		action={buildUrlWithFilters(
			`/destinations/${data.destination.slug}/delete`,
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
			<DatabaseRestore class="size-6" />
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
				wrapperClass="md:col-span-12"
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

			<FormSelect
				id="kind"
				label="Tipo"
				bind:value={$form.kind}
				error={$errors.kind}
				options={DESTINATION_KIND_OPTIONS}
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
				<div class="rounded-lg border border-base-content/10 p-4">
					{#if $form.photoUrlHero}
						<a href={$form.photoUrlHero} target="_blank">
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

<DebugApiJson data={data.destination} />
