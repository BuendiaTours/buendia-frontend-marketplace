<script lang="ts">
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction } from '$lib/actions/confirmAction';

	// Form components
	import FormInputText from '$lib/components/forms/FormInputText.svelte';
	import FormTextarea from '$lib/components/forms/FormTextarea.svelte';
	import FormSelect from '$lib/components/forms/FormSelect.svelte';
	import FormTextareaMarkdown from '$lib/components/forms/FormTextareaMarkdown.svelte';
	import FormInputSlug from '$lib/components/forms/FormInputSlug.svelte';
	import FormOrderedList from '$lib/components/forms/FormOrderedList.svelte';
	import FormGeoJson from '$lib/components/forms/FormGeoJson.svelte';

	let { data }: { data: PageData } = $props();

	const availableDestinations = data.availableDestinations;

	const { form, errors, enhance, message } = superForm(data.form, {
		dataType: 'json'
	});
</script>

<div class="mb-4 flex items-center justify-between">
	<a href={`/attractions?${$page.url.searchParams.toString()}`} class="link">
		← Volver al listado
	</a>

	<form
		method="POST"
		action={buildUrlWithFilters(
			`/attractions/${data.attraction.slug}/delete`,
			$page.url.searchParams
		)}
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
</div>

<h1>Editar Atracción</h1>

<form method="POST" use:enhance class="max-w-2xl space-y-4">
	<div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-12">
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
			options={data.availableStatuses}
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
			<div class="rounded-lg border border-base-content/10 p-4">
				{#if $form.photoUrl}
					<a href={$form.photoUrl} target="_blank">
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
			<div class="rounded-lg border border-base-content/10 p-4">
				{#if $form.photoUrlHero}
					<a href={$form.photoUrlHero} target="_blank">
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
	</div>

	<FormOrderedList
		id="destintions"
		label="Destinos"
		bind:items={$form.destinations}
		availableItems={availableDestinations}
		error={$errors.destinations?._errors}
		placeholder="Selecciona un destino..."
		emptyMessage="No hay destinos asociados"
	/>

	<FormGeoJson
		id="location"
		label="Ubicación"
		bind:value={$form.location}
		error={$errors.location}
		mapHeight="400px"
	/>

	<div class="flex justify-between">
		<a href={`/attractions/${data.attraction.slug}`} class="btn btn-soft btn-error">Cancelar</a>
		<button type="submit" class="btn btn-outline btn-primary">Guardar cambios</button>
	</div>
</form>

<h2 class="mt-8">JSON de la API</h2>
<pre class="overflow-x-auto rounded-box bg-base-200 p-4 text-xs">{JSON.stringify(
		data.attraction,
		null,
		2
	)}</pre>
