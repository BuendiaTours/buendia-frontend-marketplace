<script lang="ts">
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction, showConfirmDialog } from '$lib/actions/confirmAction';

	// Enums
	import {
		ACTIVITY_GUIDE_KIND_OPTIONS,
		ACTIVITY_NOT_SUITABLE_FOR_OPTIONS,
		ACTIVITY_STATUS_OPTIONS,
		ACTIVITY_KIND_OPTIONS,
		MEAL_KIND_OPTIONS,
		MEAL_FORMAT_OPTIONS,
		MEAL_ADDITIONAL_OPTIONS,
		MEAL_ALLERGEN_OPTIONS
	} from '$lib/config/enums';

	import {
		Map,
		DatabaseRestore,
		FolderSettings,
		Link,
		TaskList,
		OrangeSlice
	} from 'svelte-iconoir';

	// Components
	import LocationBar from '$lib/layout/partials/LocationBar.svelte';
	import DebugApiJson from '$lib/components/debug/DebugApiJson.svelte';
	import MsgMeltToast from '$lib/components/msg/MsgMeltToast.svelte';

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
		breadcrumbs
	} = data;

	// Referencia al componente toast para mostrar notificaciones
	let toastComponent: MsgMeltToast;

	const { form, errors, enhance, message } = superForm(data.form, {
		dataType: 'json',
		onUpdate({ form }) {
			// Se ejecuta después de la validación pero antes del envío
			if (!form.valid) {
				// Mostrar toast inmediatamente cuando hay errores de validación
				toastComponent?.addToast({
					data: {
						title: 'Errores en el formulario',
						description: 'Por favor, corrige los errores marcados en el formulario.',
						type: 'error'
					}
				});
			}
		},
		onError({ result }) {
			// Mostrar toast cuando hay errores de validación del servidor
			if (result.status === 400) {
				toastComponent?.addToast({
					data: {
						title: 'Errores en el formulario',
						description: 'Por favor, corrige los errores marcados en el formulario.',
						type: 'error'
					}
				});
			}
		}
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

	async function handleRemoveMeal(index: number) {
		const confirmed = await showConfirmDialog({
			title: 'Eliminar comida',
			message: '¿Estás seguro de que quieres eliminar esta comida?',
			confirmText: 'Eliminar',
			cancelText: 'Cancelar',
			danger: true
		});
		if (!confirmed) return;
		$form.meals = $form.meals.filter((_, i) => i !== index);
		// Reordenar los stages restantes
		// $form.stages.forEach((stage, i) => {
		// 	stage.order = i + 1;
		// });
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

	function handleAddMeal() {
		// Colapsar todos los acordeones hijos
		const mealAccordions = document.querySelectorAll('[name^="form-meals-"]');
		mealAccordions.forEach((accordion) => {
			if (accordion instanceof HTMLDetailsElement) {
				accordion.open = false;
			}
		});

		// Crear nueva comida
		const newMeal = {
			id: `temp-${Date.now()}`, // ID temporal hasta que se guarde
			additionalOptions: [] as string[],
			allergens: [] as string[],
			format: 'BUFFET' as const,
			kind: 'LUNCH' as const
		};

		$form.meals = [...$form.meals, newMeal];
	}
</script>

<LocationBar title="Editar Actividad" {breadcrumbs} />

<div
	class="bnd-main-actions sticky top-0 z-10 flex items-center justify-between gap-4 border-t border-base-content/10 bg-base-100 py-4"
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
				title: 'Eliminar elemento',
				message: '¿Seguro que quieres eliminar este elemento?',
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
				options={ACTIVITY_STATUS_OPTIONS}
				placeholder="Selecciona un estado"
				wrapperClass="md:col-span-4"
				selectClass={$form.status == 'APPROVED' ? 'border-2 border-success' : ''}
			/>

			<FormSelect
				id="kind"
				label="Tipo de actividad"
				bind:value={$form.kind}
				error={$errors.kind}
				options={ACTIVITY_KIND_OPTIONS}
				placeholder="Selecciona un tipo"
				wrapperClass="md:col-span-4"
			/>

			<FormSelect
				id="guideKind"
				label="Tipo de guía"
				bind:value={$form.guideKind}
				error={$errors.guideKind}
				options={ACTIVITY_GUIDE_KIND_OPTIONS}
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
			<span>Elementos incluídos, excluídos y necesarios</span>
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

			<FormCheckboxGroup
				id="notSuitableFor"
				label="No recomendado para"
				bind:value={$form.notSuitableFor}
				options={ACTIVITY_NOT_SUITABLE_FOR_OPTIONS}
				error={$errors.notSuitableFor?._errors}
				badge="opcional"
				wrapperClass="md:col-span-12"
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-meals" open>
		{#snippet title()}
			<OrangeSlice class="size-6" />
			<span>Comidas</span>
		{/snippet}
		{#snippet titleBarActions()}
			<button type="button" class="btn ml-6 btn-outline btn-xs btn-primary" onclick={handleAddMeal}>
				Añadir comida
			</button>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">Ayuda, descripcción... enlaces...</p>
		{/snippet}
		{#snippet content()}
			{#each $form.meals as meal, index}
				<FormAccordion name="form-meals-{index}" class="md:col-span-12">
					{#snippet title()}
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-base-content/50"
						>
							{index + 1}
						</div>
						<span>{meal.id}</span>
					{/snippet}
					{#snippet asideContent()}
						<p class="text-xs">Ayuda, descripcción... enlaces...</p>
					{/snippet}
					{#snippet content()}
						<!-- <input
							type="hidden"
							id={`meals[${index}][id]`}
							name={`meals[${index}][id]`}
							bind:value={meal.id}
						/> -->

						<FormInputText
							id={`meals[${index}][id]`}
							label="Id"
							bind:value={meal.id}
							readonly
							error={$errors.meals?.[index]?.id}
							wrapperClass="md:col-span-6"
						/>

						<FormSelect
							id={`stages[${index}][kind]`}
							label="Tipo"
							bind:value={meal.kind}
							error={$errors.meals?.[index]?.kind}
							options={MEAL_KIND_OPTIONS}
							placeholder="Selecciona un tipo"
							wrapperClass="md:col-span-3"
						/>

						<FormSelect
							id={`meals[${index}][format]`}
							label="Tipo"
							bind:value={meal.format}
							error={$errors.meals?.[index]?.format}
							options={MEAL_FORMAT_OPTIONS}
							placeholder="Selecciona un tipo"
							wrapperClass="md:col-span-3"
						/>

						<FormTagManager
							id="additionalOptions"
							label="Opciones adicionales"
							bind:tags={$form.meals[index].additionalOptions}
							availableTags={MEAL_ADDITIONAL_OPTIONS}
							valueType="string"
							error={$errors.meals?.[index]?.additionalOptions?._errors}
							wrapperClass="md:col-span-12"
							placeholder="Selecciona las opciónes adicionales..."
						/>

						<FormTagManager
							id="allergens"
							label="Alérgenos"
							bind:tags={$form.meals[index].allergens}
							availableTags={MEAL_ALLERGEN_OPTIONS}
							valueType="string"
							error={$errors.meals?.[index]?.allergens?._errors}
							wrapperClass="md:col-span-12"
							placeholder="Selecciona los lárgenos"
						/>

						<div class="flex gap-2 md:col-span-12">
							<button
								type="button"
								class="btn ml-auto btn-soft btn-xs btn-error"
								onclick={() => handleRemoveMeal(index)}
							>
								Eliminar esta comida
							</button>
						</div>
					{/snippet}
				</FormAccordion>
			{/each}
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

<DebugApiJson data={activity} />

<MsgMeltToast bind:this={toastComponent} />
