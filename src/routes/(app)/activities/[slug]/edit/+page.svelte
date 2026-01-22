<script lang="ts">
	import type { ActivityDetail } from '$lib/types';
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
	import FormTextareaMarkdown from '$lib/components/form/FormTextareaMarkdown.svelte';
	import Tag from '$lib/components/Tag.svelte';

	let { data }: { data: PageData } = $props();
	const { activity } = data;

	const { form, errors, enhance, message } = superForm(data.form, {
		dataType: 'json'
	});

	function generateSlug() {
		if ($form.title) {
			$form.slug = slugify($form.title);
		}
	}

	function removeTag(index: number) {
		$form.tags = $form.tags.filter((_, i) => i !== index);
	}
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
		<FormTextInput
			id="id"
			label="Id"
			badge="read only"
			bind:value={$form.id}
			error={$errors.id}
			readonly
			wrapperClass="md:col-span-9"
		/>

		<FormTextInput
			id="codeRef"
			label="codeRef"
			badge="disabled"
			bind:value={$form.codeRef}
			error={$errors.codeRef}
			disabled
			wrapperClass="md:col-span-3"
		/>

		<FormTextInput
			id="title"
			label="Title"
			badge="read only"
			bind:value={$form.title}
			error={$errors.title}
			readonly
		/>

		<div class="md:col-span-12">
			<span class="label text-sm">Tags</span>
			<div class="flex flex-wrap gap-2">
				{#if $form.tags.length === 0}
					<span class="text-sm text-base-content/50">No hay tags asignados</span>
				{:else}
					{#each $form.tags as tag, i}
						<Tag
							name="tags[{i}][id]"
							value={tag.id}
							class="badge-primary"
							removable
							onremove={() => removeTag(i)}
						>
							{tag.name}
							<input type="hidden" name="tags[{i}][name]" value={tag.name} />
						</Tag>
					{/each}
				{/if}
			</div>
			{#if $errors.tags?._errors}
				<p class="mt-1 text-sm text-error">{$errors.tags._errors[0]}</p>
			{/if}
		</div>

		<div class="md:col-span-12">
			<label class="label text-sm" for="slug">Slug</label>
			<div class="flex gap-2">
				<input
					type="text"
					id="slug"
					name="slug"
					class="input w-full"
					class:input-error={$errors.slug}
					bind:value={$form.slug}
				/>

				<div class="tooltip" data-tip="Genera slug a partir del título">
					<button type="button" class="btn btn-square btn-soft" onclick={generateSlug}>
						<Refresh />
					</button>
				</div>
			</div>
			<FormErrorMsg error={$errors.slug} />
		</div>

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
			rows="3"
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

		<FormTextInput
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
