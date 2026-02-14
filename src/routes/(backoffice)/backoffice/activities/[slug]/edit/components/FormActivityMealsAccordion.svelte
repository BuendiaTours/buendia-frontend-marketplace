<script lang="ts">
	import { tick } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import { showConfirmDialog } from '$lib/actions/backoffice/confirmAction';
	import { OrangeSlice } from 'svelte-iconoir';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import FormTagManager from '$lib/components/backoffice/forms/FormTagManager.svelte';
	import {
		MEAL_KIND_OPTIONS,
		MEAL_FORMAT_OPTIONS,
		MEAL_ADDITIONAL_OPTIONS,
		MEAL_ALLERGEN_OPTIONS
	} from '$api-activities/enums';

	interface Meal {
		id: string;
		additionalOptions: string[];
		allergens: string[];
		format: string | null;
		kind: string | null;
	}

	interface Props {
		meals: Meal[];
		errors?: any;
	}

	let { meals = $bindable(), errors }: Props = $props();

	async function handleRemoveMeal(index: number) {
		const confirmed = await showConfirmDialog({
			title: 'Eliminar comida',
			message: '¿Estás seguro de que quieres eliminar esta comida?',
			confirmText: 'Eliminar',
			cancelText: 'Cancelar',
			danger: true
		});
		if (!confirmed) return;
		meals = meals.filter((_, i) => i !== index);
	}

	async function handleAddMeal() {
		// Colapsar todos los acordeones hijos
		const mealAccordions = document.querySelectorAll('[name^="form-meals-"]');
		mealAccordions.forEach((accordion) => {
			if (accordion instanceof HTMLDetailsElement) {
				accordion.open = false;
			}
		});

		// Crear nueva comida
		const newMeal = {
			id: uuidv4(),
			additionalOptions: [] as string[],
			allergens: [] as string[],
			format: null,
			kind: null
		};

		meals = [...meals, newMeal];

		// Esperar a que Svelte actualice el DOM
		await tick();

		// Abrir el nuevo acordeón
		const newIndex = meals.length - 1;
		const newAccordion = document.querySelector(
			`[name="form-meals-${newIndex}"]`
		) as HTMLDetailsElement;
		if (newAccordion) {
			newAccordion.open = true;
			// Añadir borde verde inicial y animación de fade
			newAccordion.classList.add('animate-fade-border-success');

			// Remover clases después de la animación (2s)
			setTimeout(() => {
				newAccordion.classList.remove('animate-fade-border-success');
			}, 2000);
		}
	}
</script>

<FormAccordion name="form-meals">
	{#snippet title()}
		<OrangeSlice class="size-6" />
		<span>Comidas</span>
	{/snippet}
	{#snippet titleBarActions()}
		<button type="button" class="btn btn-outline btn-xs btn-primary ml-6" onclick={handleAddMeal}>
			Añadir comida
		</button>
	{/snippet}
	{#snippet asideContent()}
		<p class="text-xs">Ayuda, descripcción... enlaces...</p>
	{/snippet}
	{#snippet content()}
		{#each meals as meal, index}
			<FormAccordion name="form-meals-{index}" class="md:col-span-12">
				{#snippet title()}
					<div
						class="border-base-content/50 flex h-8 w-8 items-center justify-center rounded-full border-2"
					>
						{index + 1}
					</div>
					<span>{meal.id}</span>
				{/snippet}
				{#snippet asideContent()}
					<p class="text-xs">Ayuda, descripcción... enlaces...</p>
				{/snippet}
				{#snippet content()}
					<FormInputText
						id={`meals[${index}][id]`}
						label="Id"
						bind:value={meal.id}
						readonly
						error={errors?.[index]?.id}
						wrapperClass="md:col-span-6"
					/>

					<FormSelect
						id={`meals[${index}][kind]`}
						label="Tipo"
						bind:value={meal.kind}
						error={errors?.[index]?.kind}
						options={MEAL_KIND_OPTIONS}
						placeholder="Selecciona un tipo"
						wrapperClass="md:col-span-3"
					/>

					<FormSelect
						id={`meals[${index}][format]`}
						label="Formato"
						bind:value={meal.format}
						error={errors?.[index]?.format}
						options={MEAL_FORMAT_OPTIONS}
						placeholder="Selecciona un formato"
						wrapperClass="md:col-span-3"
					/>

					<FormTagManager
						id="additionalOptions-{index}"
						label="Opciones adicionales"
						bind:tags={meals[index].additionalOptions}
						availableTags={MEAL_ADDITIONAL_OPTIONS}
						valueType="string"
						error={errors?.[index]?.additionalOptions?._errors}
						wrapperClass="md:col-span-12"
						placeholder="Selecciona las opciónes adicionales..."
						onTagsChange={() => {
							meals = [...meals];
						}}
					/>

					<FormTagManager
						id="allergens-{index}"
						label="Alérgenos"
						bind:tags={meals[index].allergens}
						availableTags={MEAL_ALLERGEN_OPTIONS}
						valueType="string"
						error={errors?.[index]?.allergens?._errors}
						wrapperClass="md:col-span-12"
						placeholder="Selecciona los alérgenos"
						onTagsChange={() => {
							meals = [...meals];
						}}
					/>

					<div class="flex gap-2 md:col-span-12">
						<button
							type="button"
							class="btn btn-soft btn-xs btn-error ml-auto"
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
