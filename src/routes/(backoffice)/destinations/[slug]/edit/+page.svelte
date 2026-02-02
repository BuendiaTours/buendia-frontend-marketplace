<script lang="ts">
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction } from '$lib/actions/confirmAction';
	import { page } from '$app/stores';
	import { Refresh } from 'svelte-iconoir';
	import { slugify } from '$lib/utils/strings';
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';

	// Form components
	import FormInputText from '$lib/components/forms/FormInputText.svelte';
	import FormErrorMsg from '$lib/components/forms/FormErrorMsg.svelte';
	import FormTextarea from '$lib/components/forms/FormTextarea.svelte';
	import FormAccordion from '$lib/components/forms/layout/FormAccordion.svelte';

	// Components
	import LocationBar from '$lib/layout/partials/LocationBar.svelte';

	// Icons
	import { DatabaseRestore } from 'svelte-iconoir';
	import FormInputSlug from '$lib/components/forms/FormInputSlug.svelte';

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
	class="sticky top-0 z-10 mb-1 flex items-center justify-between gap-4 border-t border-b border-base-content/10 bg-base-100 py-4"
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

			<div class="md:col-span-12">
				<label class="label text-sm" for="kind">Tipo</label>
				<select
					id="kind"
					name="kind"
					class="select w-full"
					class:select-error={$errors.kind}
					bind:value={$form.kind}
				>
					<option value="CITY">Ciudad</option>
					<option value="REGION">Región</option>
					<option value="COUNTRY">País</option>
				</select>
				<FormErrorMsg error={$errors.kind} />
			</div>

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

<h2 class="mt-8">JSON de la API</h2>
<pre class="overflow-x-auto rounded-box bg-base-200 p-4 text-xs">{JSON.stringify(
		data.destination,
		null,
		2
	)}</pre>
