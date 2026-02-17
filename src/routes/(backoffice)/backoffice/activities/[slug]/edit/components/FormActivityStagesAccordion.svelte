<script lang="ts">
	import { tick } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import { showConfirmDialog } from '$lib/actions/backoffice/confirmAction';
	import { Map } from 'svelte-iconoir';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormTextarea from '$lib/components/backoffice/forms/FormTextarea.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import FormGeoJson from '$lib/components/backoffice/forms/FormGeoJson.svelte';

	// Enums
	import {
		STAGE_KIND_OPTIONS,
		STAGE_RELEVANCE_OPTIONS,
		STAGE_REQUIREMENT_OPTIONS
	} from '$lib/labels/activities';

	type Stage = {
		id: string;
		activityId: string;
		order: number;
		name: string;
		description?: string;
		duration?: string;
		location: {
			type: 'Point';
			coordinates: [number, number];
		} | null;
		kind: string | null;
		relevance: string | null;
		requirement: string | null;
	};

	type Props = {
		stages: Stage[];
		activityId: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Superforms nested array error type is deeply recursive
		errors?: any;
		locationBackups: Record<number, { type: 'Point'; coordinates: [number, number] } | null>;
	};

	let { stages = $bindable(), activityId, errors, locationBackups = $bindable() }: Props = $props();

	// Estado para drag & drop de stages
	let draggedStageIndex = $state<number | null>(null);

	function handleStageDragStart(event: DragEvent, index: number) {
		draggedStageIndex = index;
		if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
	}

	function handleStageDragOver(event: DragEvent) {
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
	}

	function handleStageDrop(event: DragEvent, targetIndex: number) {
		event.preventDefault();
		if (draggedStageIndex === null || draggedStageIndex === targetIndex) return;

		// Reordenar el array
		const stagesCopy = [...stages];
		const [draggedStage] = stagesCopy.splice(draggedStageIndex, 1);
		stagesCopy.splice(targetIndex, 0, draggedStage);

		// Actualizar los valores de order
		stagesCopy.forEach((stage, idx) => {
			stage.order = idx + 1;
		});

		stages = stagesCopy;
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

		stages = stages.filter((_, i) => i !== index);

		// Reordenar los stages restantes
		stages.forEach((stage, i) => {
			stage.order = i + 1;
		});
	}

	async function handleAddStage() {
		// Colapsar todos los acordeones hijos
		const stageAccordions = document.querySelectorAll('[name^="form-stages-"]');
		stageAccordions.forEach((accordion) => {
			if (accordion instanceof HTMLDetailsElement) {
				accordion.open = false;
			}
		});

		// Crear nuevo stage
		const newOrder = stages.length + 1;
		const newStage = {
			id: uuidv4(),
			activityId: activityId,
			order: newOrder,
			name: `Etapa ${newOrder}`,
			description: '',
			duration: '',
			location: null,
			kind: null,
			relevance: null,
			requirement: null
		};

		stages = [...stages, newStage];

		// Esperar a que Svelte actualice el DOM
		await tick();

		// Abrir el nuevo acordeón
		const newIndex = stages.length - 1;
		const newAccordion = document.querySelector(
			`[name="form-stages-${newIndex}"]`
		) as HTMLDetailsElement;
		if (newAccordion) {
			newAccordion.open = true;
			// Añadir animación de fade del borde verde
			newAccordion.classList.add('animate-fade-border-success');
		}
	}
</script>

<FormAccordion name="form-stages">
	{#snippet title()}
		<Map class="size-6" />
		<span>Itinerario y traslados</span>
	{/snippet}
	{#snippet titleBarActions()}
		<button type="button" class="btn btn-outline btn-xs btn-primary ml-6" onclick={handleAddStage}>
			Añadir etapa
		</button>
	{/snippet}
	{#snippet asideContent()}
		<p class="text-xs">Ayuda, descripcción... enlaces...</p>
	{/snippet}
	{#snippet content()}
		{#each stages as stage, index (stage.id)}
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
						class="border-base-content/50 flex h-8 w-8 items-center justify-center rounded-full border-2"
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
						error={errors?.[index]?.name}
						wrapperClass="md:col-span-10"
					/>

					<FormInputText
						id={`stages[${index}][duration]`}
						label="Duración"
						bind:value={stage.duration}
						error={errors?.[index]?.duration}
						wrapperClass="md:col-span-2"
						badge="opcional"
					/>

					<FormTextarea
						id={`stages[${index}][description]`}
						label="Descripción"
						bind:value={stage.description}
						error={errors?.[index]?.description}
						wrapperClass="md:col-span-12"
						rows={3}
						badge="opcional"
					/>

					<FormSelect
						id={`stages[${index}][kind]`}
						label="Tipo"
						bind:value={stage.kind}
						error={errors?.[index]?.kind}
						options={STAGE_KIND_OPTIONS}
						placeholder="Selecciona un tipo"
						wrapperClass="md:col-span-4"
					/>

					<FormSelect
						id={`stages[${index}][relevance]`}
						label="Relevancia"
						bind:value={stage.relevance}
						error={errors?.[index]?.relevance}
						options={STAGE_RELEVANCE_OPTIONS}
						placeholder="Selecciona relevancia"
						wrapperClass="md:col-span-4"
					/>

					<FormSelect
						id={`stages[${index}][requirement]`}
						label="Requisito"
						bind:value={stage.requirement}
						error={errors?.[index]?.requirement}
						options={STAGE_REQUIREMENT_OPTIONS}
						placeholder="Selecciona requisito"
						wrapperClass="md:col-span-4"
					/>

					<div class="md:col-span-12">
						<label class="label cursor-pointer justify-start gap-3">
							<input
								type="checkbox"
								checked={stages[index].location !== null}
								onchange={(e) => {
									if (e.currentTarget.checked) {
										// Activar: restaurar backup o usar coordenadas por defecto
										if (locationBackups[index]) {
											stages[index].location = locationBackups[index];
										} else {
											stages[index].location = {
												type: 'Point',
												coordinates: [-3.7038, 40.4168] // Madrid por defecto
											};
										}
									} else {
										// Desactivar: guardar backup y establecer a null
										if (stages[index].location) {
											locationBackups[index] = { ...stages[index].location };
										}
										stages[index].location = null;
									}
									// Forzar reactividad
									stages = [...stages];
								}}
								class="toggle toggle-success"
							/>
							<span class="text-sm">Tiene ubicación geográfica</span>
						</label>
					</div>

					{#if stages[index].location}
						<FormGeoJson
							id={`stages[${index}][location]`}
							label="Ubicación"
							bind:value={stages[index].location}
							mapClass="h-[250px]"
							config={{
								showSearchBox: true,
								defaultZoom: 15
							}}
							error={errors?.[index]?.location?._errors}
							wrapperClass="md:col-span-12"
							badge="opcional"
						/>
					{/if}

					<div class="flex gap-2 md:col-span-12">
						<button
							type="button"
							class="btn btn-soft btn-xs btn-error ml-auto"
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
