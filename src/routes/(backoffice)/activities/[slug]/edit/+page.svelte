<script lang="ts">
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction, showConfirmDialog } from '$lib/actions/confirmAction';

	import { Map, DatabaseRestore, FolderSettings, Link, TaskList } from 'svelte-iconoir';

	// Components
	import LocationBar from '$lib/layout/partials/LocationBar.svelte';

	// Form layout
	import FormAccordion from '$lib/components/forms/layout/FormAccordion.svelte';

	// Form
	import FormCheckboxGroup from '$lib/components/forms/FormCheckboxGroup.svelte';
	import FormInputSlug from '$lib/components/forms/FormInputSlug.svelte';
	import FormInputText from '$lib/components/forms/FormInputText.svelte';
	import FormOrderedObjectList from '$lib/components/forms/FormOrderedObjectList.svelte';
	import FormSelect from '$lib/components/forms/FormSelect.svelte';
	import FormTagManager from '$lib/components/forms/FormTagManager.svelte';
	import FormTextarea from '$lib/components/forms/FormTextarea.svelte';
	import FormTextareaMarkdown from '$lib/components/forms/FormTextareaMarkdown.svelte';
	import FormOrderedStringList from '$lib/components/forms/FormOrderedStringList.svelte';
	import FormGeoJson from '$lib/components/forms/FormGeoJson.svelte';

	let { data }: { data: PageData } = $props();
	const {
		activity,
		availableTags,
		availableCategories,
		availableAttractions,
		availableDistributives,
		availableStatuses,
		availableKinds,
		availableGuideKinds,
		breadcrumbs
	} = data;

	const { form, errors, enhance, message } = superForm(data.form, {
		dataType: 'json'
	});

	// Backup de coordenadas por stage (para poder restaurar si se desactiva/activa el toggle)
	let locationBackups = $state<
		Record<number, { type: 'Point'; coordinates: [number, number] } | null>
	>({});

	// Estado para drag & drop de stages
	let draggedStageIndex = $state<number | null>(null);

	function handleStageDragStart(event: DragEvent, index: number) {
		draggedStageIndex = index;
		event.dataTransfer!.effectAllowed = 'move';
	}

	function handleStageDragOver(event: DragEvent) {
		event.preventDefault();
		event.dataTransfer!.dropEffect = 'move';
	}

	function handleStageDrop(event: DragEvent, targetIndex: number) {
		event.preventDefault();
		if (draggedStageIndex === null || draggedStageIndex === targetIndex) return;

		// Reordenar el array
		const stages = [...$form.stages];
		const [draggedStage] = stages.splice(draggedStageIndex, 1);
		stages.splice(targetIndex, 0, draggedStage);

		// Actualizar los valores de order
		stages.forEach((stage, idx) => {
			stage.order = idx + 1;
		});

		$form.stages = stages;
		draggedStageIndex = null;
	}

	function handleStageDragEnd() {
		draggedStageIndex = null;
	}

	async function handleRemoveStage(index: number) {
		const confirmed = await showConfirmDialog({
			title: 'Eliminar etapa',
			message: '¿Estás seguro de que quieres eliminar esta etapa?',
			confirmText: 'Eliminar',
			cancelText: 'Cancelar',
			danger: true
		});

		if (!confirmed) return;

		$form.stages = $form.stages.filter((_, i) => i !== index);

		// Reordenar los stages restantes
		$form.stages.forEach((stage, i) => {
			stage.order = i + 1;
		});
	}

	function handleAddStage() {
		// Colapsar todos los acordeones hijos
		const stageAccordions = document.querySelectorAll('[name^="form-stages-"]');
		stageAccordions.forEach((accordion) => {
			if (accordion instanceof HTMLDetailsElement) {
				accordion.open = false;
			}
		});

		// Crear nuevo stage
		const newOrder = $form.stages.length + 1;
		const newStage = {
			id: `temp-${Date.now()}`, // ID temporal hasta que se guarde
			activityId: $form.id,
			order: newOrder,
			name: `Etapa ${newOrder}`,
			description: '',
			duration: '',
			location: null, // Geolocalización desactivada por defecto
			kind: 'EXPERIENCE' as const,
			relevance: 'MEDIUM' as const,
			requirement: 'REQUIRED' as const
		};

		$form.stages = [...$form.stages, newStage];
	}
</script>

<div
	class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-base-content/10 bg-base-100 py-4"
>
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

<LocationBar title="Editar Actividad" {breadcrumbs} />

<form id="edit-form" method="POST" use:enhance class="space-y-4">
	<FormAccordion name="form-base-data" open>
		{#snippet title()}
			<DatabaseRestore class="size-6" />
			<span>Datos base</span>
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
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-cats-tags">
		{#snippet title()}
			<FolderSettings class="size-6" />
			<span>Categorización</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">Ayuda, descripcción... enlaces...</p>
		{/snippet}
		{#snippet content()}
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
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-vinculaciones">
		{#snippet title()}
			<Link class="size-6" />
			<span>Vinculaciones</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">Ayuda, descripcción... enlaces...</p>
		{/snippet}
		{#snippet content()}
			<FormOrderedObjectList
				id="attractions"
				label="Atracciones"
				bind:items={$form.attractions}
				availableItems={availableAttractions}
				error={$errors.attractions?._errors}
				placeholder="Selecciona una atracción..."
				emptyMessage="No hay atracciones asociadas"
			/>

			<FormOrderedObjectList
				id="destinations"
				label="Destinos"
				bind:items={$form.destinations}
				availableItems={data.availableDestinations}
				placeholder="Selecciona un destino..."
				emptyMessage="No hay destinos asociados"
				config={{ useDragAndDrop: true, showRemoveAll: true }}
				error={$errors.destinations?._errors}
			/>

			<FormOrderedObjectList
				id="distributives"
				label="Páginas distributivas a las que pertenece"
				bind:items={$form.distributives}
				availableItems={availableDistributives}
				error={$errors.distributives?._errors}
				placeholder="Selecciona un distributiva..."
				emptyMessage="No hay distributivas asociadas"
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-includes">
		{#snippet title()}
			<TaskList class="size-6" />
			<span>Elementos incluídos, excluídoss y necesarios</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">Ayuda, descripcción... enlaces...</p>
		{/snippet}
		{#snippet content()}
			<FormOrderedStringList
				id="included"
				label="Elementos incluidos"
				bind:items={$form.included}
				error={$errors.included?._errors}
				placeholder="Escribe un elemento incluido..."
				badge="opcional"
			/>

			<FormOrderedStringList
				id="itemsToBring"
				label="Elementos necesarios para la actividad"
				bind:items={$form.itemsToBring}
				error={$errors.itemsToBring?._errors}
				placeholder="Escribe un elemento necesario..."
				badge="opcional"
			/>

			<FormOrderedStringList
				id="excluded"
				label="Elementos excluidos"
				bind:items={$form.excluded}
				error={$errors.excluded?._errors}
				placeholder="Escribe un elemento a excluir..."
				badge="opcional"
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-stages" open>
		{#snippet title()}
			<Map class="size-6" />
			<span>Itinerario y traslados</span>
		{/snippet}
		{#snippet titleBarActions()}
			<button
				type="button"
				class="btn ml-6 btn-outline btn-xs btn-primary"
				onclick={handleAddStage}
			>
				Añadir etapa
			</button>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">Ayuda, descripcción... enlaces...</p>
		{/snippet}
		{#snippet content()}
			{#each $form.stages as stage, index}
				<FormAccordion
					name="form-stages-{index}"
					class="md:col-span-12"
					sortable
					ondragstart={(e) => handleStageDragStart(e, index)}
					ondragover={handleStageDragOver}
					ondrop={(e) => handleStageDrop(e, index)}
					ondragend={handleStageDragEnd}
				>
					{#snippet title()}
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-base-content/50"
						>
							{stage.order || index + 1}
						</div>
						<span>{stage.name}</span>
					{/snippet}
					{#snippet asideContent()}
						<p class="text-xs">Ayuda, descripcción... enlaces...</p>
					{/snippet}
					{#snippet content()}
						<input
							type="hidden"
							id={`stages[${index}][order]`}
							name={`stages[${index}][order]`}
							bind:value={stage.order}
						/>

						<input
							type="hidden"
							id={`stages[${index}][id]`}
							name={`stages[${index}][id]`}
							bind:value={stage.id}
						/>

						<input
							type="hidden"
							id={`stages[${index}][activityId]`}
							name={`stages[${index}][activityId]`}
							bind:value={stage.activityId}
						/>

						<FormInputText
							id={`stages[${index}][name]`}
							label="Nombre"
							bind:value={stage.name}
							error={$errors.stages?.[index]?.name}
							wrapperClass="md:col-span-10"
						/>

						<FormInputText
							id={`stages[${index}][duration]`}
							label="Duración"
							bind:value={stage.duration}
							error={$errors.stages?.[index]?.duration}
							wrapperClass="md:col-span-2"
							badge="opcional"
						/>

						<FormTextarea
							id={`stages[${index}][description]`}
							label="Descripción"
							bind:value={stage.description}
							error={$errors.stages?.[index]?.description}
							wrapperClass="md:col-span-12"
							rows={3}
							badge="opcional"
						/>

						<FormSelect
							id={`stages[${index}][kind]`}
							label="Tipo"
							bind:value={stage.kind}
							error={$errors.stages?.[index]?.kind}
							options={[
								{ id: 'EXPERIENCE', name: 'Experiencia' },
								{ id: 'TRANSFER', name: 'Traslado' },
								{ id: 'MEAL', name: 'Comida' },
								{ id: 'ACCOMMODATION', name: 'Alojamiento' },
								{ id: 'OTHER', name: 'Otro' }
							]}
							placeholder="Selecciona un tipo"
							wrapperClass="md:col-span-4"
						/>

						<FormSelect
							id={`stages[${index}][relevance]`}
							label="Relevancia"
							bind:value={stage.relevance}
							error={$errors.stages?.[index]?.relevance}
							options={[
								{ id: 'HIGH', name: 'Alta' },
								{ id: 'MEDIUM', name: 'Media' },
								{ id: 'LOW', name: 'Baja' },
								{ id: 'NONE', name: 'Ninguna' }
							]}
							placeholder="Selecciona relevancia"
							wrapperClass="md:col-span-4"
						/>

						<FormSelect
							id={`stages[${index}][requirement]`}
							label="Requisito"
							bind:value={stage.requirement}
							error={$errors.stages?.[index]?.requirement}
							options={[
								{ id: 'REQUIRED', name: 'Requerido' },
								{ id: 'OPTIONAL', name: 'Opcional' },
								{ id: 'CONDITIONAL', name: 'Condicional' }
							]}
							placeholder="Selecciona requisito"
							wrapperClass="md:col-span-4"
						/>

						<div class="md:col-span-12">
							<label class="label cursor-pointer justify-start gap-3">
								<input
									type="checkbox"
									checked={stage.location !== null}
									onchange={(e) => {
										if (e.currentTarget.checked) {
											// Activar: restaurar backup o usar coordenadas por defecto
											if (locationBackups[index]) {
												stage.location = locationBackups[index];
											} else {
												stage.location = {
													type: 'Point',
													coordinates: [-3.7038, 40.4168] // Madrid por defecto
												};
											}
										} else {
											// Desactivar: guardar backup y establecer a null
											if (stage.location) {
												locationBackups[index] = { ...stage.location };
											}
											stage.location = null;
										}
									}}
									class="toggle toggle-success"
								/>
								<span class="text-sm">Tiene ubicación geográfica</span>
							</label>
						</div>

						{#if stage.location}
							<FormGeoJson
								id={`stages[${index}][location]`}
								label="Ubicación"
								bind:value={stage.location}
								mapClass="h-[250px]"
								config={{
									showSearchBox: true,
									defaultZoom: 15
								}}
								error={$errors.stages?.[index]?.location?._errors}
								wrapperClass="md:col-span-12"
								badge="opcional"
							/>
						{/if}

						<div class="flex gap-2 md:col-span-12">
							<button
								type="button"
								class="btn ml-auto btn-soft btn-xs btn-error"
								onclick={() => handleRemoveStage(index)}
							>
								Eliminar esta etapa
							</button>
						</div>
					{/snippet}
				</FormAccordion>
			{/each}
		{/snippet}
	</FormAccordion>

	<!-- <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-12">
		<div class="pt-o pt-7 md:col-span-3">
			<label class="label w-full cursor-pointer text-sm">
				<input type="checkbox" name="isFreeTour" class="checkbox" bind:checked={$form.isFreeTour} />
				<span class="label-text">Es Free Tour</span>
			</label>
		</div>
	</div> -->
</form>

<h2 class="mt-8 text-sm">JSON de la API</h2>
<pre class="overflow-x-auto rounded-box bg-base-200 p-4 text-xs">{JSON.stringify(
		activity,
		null,
		2
	)}</pre>
