<script lang="ts">
	import type { Destination } from '$lib/types';
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction } from '$lib/actions/confirmAction';
	import { slugify } from '$lib/utils/strings';
	import { Refresh } from 'svelte-iconoir';
	import FormTextInput from '$lib/components/forms/FormTextInput.svelte';
	import FormErrorMsg from '$lib/components/forms/FormErrorMsg.svelte';
	import FormTextarea from '$lib/components/forms/FormTextarea.svelte';

	let { data }: { data: PageData } = $props();

	const { form, errors, enhance, message } = superForm(data.form, {
		dataType: 'json'
	});

	function generateSlug() {
		if ($form.name) {
			$form.slug = slugify($form.name);
		}
	}
</script>

<div class="mb-4 flex items-center justify-between">
	<a href={`/destinations?${$page.url.searchParams.toString()}`} class="link">
		← Volver al listado
	</a>

	<form
		method="POST"
		action={buildUrlWithFilters(
			`/destinations/${data.destination.slug}/delete`,
			$page.url.searchParams
		)}
	>
		<button
			type="submit"
			class="btn btn-soft btn-error"
			use:confirmAction={{
				title: 'Eliminar destino',
				message: '¿Estás seguro de que quieres eliminar este destino?',
				confirmText: 'Eliminar',
				cancelText: 'Cancelar',
				danger: true
			}}
		>
			Delete
		</button>
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

		<FormTextInput
			id="photoUrlHero"
			label="URL de imagen principal"
			type="url"
			bind:value={$form.photoUrlHero}
			error={$errors.photoUrlHero}
			wrapperClass="md:col-span-8"
			placeholder="https://example.com/image.jpg"
		/>
	</div>

	<div class="flex justify-between">
		<a href={`/destinations/${data.destination.slug}`} class="btn btn-soft btn-error">Cancelar</a>
		<button type="submit" class="btn btn-outline btn-primary">Guardar cambios</button>
	</div>
</form>

<h2 class="mt-8">JSON de la API</h2>
<pre class="overflow-x-auto rounded-box bg-base-200 p-4 text-xs">{JSON.stringify(
		data.destination,
		null,
		2
	)}</pre>
