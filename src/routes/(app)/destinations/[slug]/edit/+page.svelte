<script lang="ts">
	import type { Destination } from '$lib/types';
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction } from '$lib/actions/confirmAction';
	import { slugify } from '$lib/utils/strings';
	import { Refresh } from 'svelte-iconoir';
	import FormTextInput from '$lib/components/form/FormTextInput.svelte';
	import FormErrorMsg from '$lib/components/form/FormErrorMsg.svelte';
	import FormTextarea from '$lib/components/form/FormTextarea.svelte';

	let { data }: { data: PageData } = $props();
	const { destination } = data;

	const { form, errors, enhance, message } = superForm(data.form, {
		dataType: 'json'
	});

	function generateSlug() {
		if ($form.name) {
			$form.slug = slugify($form.name);
		}
	}
</script>

<svelte:head>
	<title>Editar {destination.name} - Destinos</title>
</svelte:head>

<div class="mb-4 flex items-center justify-between">
	<a href={`/destinations?${$page.url.searchParams.toString()}`} class="link">
		← Volver al listado
	</a>

	<form
		method="POST"
		action={buildUrlWithFilters(`/destinations/${destination.slug}/delete`, $page.url.searchParams)}
		use:confirmAction={{
			title: 'Eliminar destino',
			message: '¿Seguro que quieres eliminar este destino?',
			confirmText: 'Eliminar',
			cancelText: 'Cancelar',
			danger: true
		}}
	>
		<button type="submit" class="btn btn-soft btn-error">Delete</button>
	</form>
</div>

<h1>Editar Destino</h1>

<form method="POST" use:enhance class="max-w-2xl space-y-4">
	<div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-12">
		<FormTextInput
			id="id"
			label="Id"
			badge="read only"
			bind:value={$form.id}
			error={$errors.id}
			readonly
			wrapperClass="md:col-span-12"
		/>

		<FormTextInput
			id="name"
			label="Nombre"
			bind:value={$form.name}
			error={$errors.name}
			wrapperClass="md:col-span-12"
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

				<div class="tooltip" data-tip="Genera slug a partir del nombre">
					<button type="button" class="btn btn-square btn-soft" onclick={generateSlug}>
						<Refresh />
					</button>
				</div>
			</div>
			<FormErrorMsg error={$errors.slug} />
		</div>

		<div class="md:col-span-12">
			<label class="label text-sm" for="kind"><span>Tipo</span></label>
			<select
				id="kind"
				name="kind"
				class="select w-full"
				class:select-error={$errors.kind}
				bind:value={$form.kind}
			>
				<option value="">Selecciona un tipo</option>
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
			rows="3"
			wrapperClass="md:col-span-12"
		/>

		<FormTextInput
			id="photoUrlHero"
			label="URL de imagen Hero"
			bind:value={$form.photoUrlHero}
			error={$errors.photoUrlHero}
			wrapperClass="md:col-span-12"
		/>

		{#if $form.photoUrlHero}
			<div class="md:col-span-12">
				<label class="label text-sm"><span>Vista previa</span></label>
				<img
					src={$form.photoUrlHero}
					alt="Preview"
					class="h-48 w-auto rounded-lg object-cover"
					onerror={(e) => {
						e.currentTarget.style.display = 'none';
					}}
				/>
			</div>
		{/if}
	</div>

	<div class="flex justify-between">
		<a href={`/destinations/${destination.slug}`} class="btn btn-soft btn-error">Cancelar</a>
		<button type="submit" class="btn btn-outline btn-primary">Guardar cambios</button>
	</div>
</form>

<h2 class="mt-8">JSON de la API</h2>
<pre class="overflow-x-auto rounded-box bg-base-200 p-4 text-xs">{JSON.stringify(
		destination,
		null,
		2
	)}</pre>
