<script lang="ts">
	import { v4 as uuidv4 } from 'uuid';
	import { showConfirmDialog } from '$lib/actions/confirmAction';
	import { Map } from 'svelte-iconoir';
	import FormAccordion from '$lib/components/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/forms/FormInputText.svelte';
	import FormTextarea from '$lib/components/forms/FormTextarea.svelte';
	import FormSelect from '$lib/components/forms/FormSelect.svelte';
	import FormGeoJson from '$lib/components/forms/FormGeoJson.svelte';

	interface Stage {
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
	}

	interface Props {
		stages: Stage[];
		activityId: string;
		errors?: any;
		locationBackups: Record<number, { type: 'Point'; coordinates: [number, number] } | null>;
	}

	let { stages = $bindable(), activityId, errors, locationBackups = $bindable() }: Props = $props();

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

	function handleAddStage() {
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
	}
</script>

<FormAccordion name="form-stages">
	{#snippet title()}
		<Map class="size-6" />
		<span>Itinerario y traslados</span>
	{/snippet}
	{#snippet titleBarActions()}
		<button type="button" class="btn ml-6 btn-outline btn-xs btn-primary" onclick={handleAddStage}>
			Añadir etapa
		</button>
	{/snippet}
	{#snippet asideContent()}
		<p class="text-xs">Ayuda, descripcción... enlaces...</p>
	{/snippet}
	{#snippet content()}
		{#each stages as stage, index}
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
						error={errors?.[index]?.relevance}
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
						error={errors?.[index]?.requirement}
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
							error={errors?.[index]?.location?._errors}
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
