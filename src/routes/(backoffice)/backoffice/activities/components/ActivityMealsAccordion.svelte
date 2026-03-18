<script lang="ts">
	/**
	 * ActivityMealsAccordion — Manages activity meals as sub-resources.
	 * Each meal has a kind, format, dietary options (additionalOptions) and allergens.
	 * Uses a dialog for creation and direct API calls (addMeal / removeMeal).
	 */
	import * as m from '$paraglide/messages';
	import { v4 as uuidv4 } from 'uuid';
	import { Add, Close } from '$lib/icons/Linear';
	import type { MealAdditional, ActivityAllergen } from '$core/activities/enums';
	import { MealKind, MealFormat } from '$core/activities/enums';
	import { ACTIVITY_REQUEST } from '$core/activities/requests';
	import { showConfirmDialog } from '$lib/actions/backoffice/confirmAction';
	import type { ActivityMeal } from '$core/activities/types';
	import {
		MEAL_KIND_OPTIONS,
		MEAL_FORMAT_OPTIONS,
		MEAL_ADDITIONAL_OPTIONS,
		ACTIVITY_ALLERGEN_OPTIONS
	} from '$lib/labels/activities';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import PureHtmlDialog from '$lib/components/backoffice/PureHtmlDialog.svelte';

	type ToastFn = (data: {
		data: { title: string; description: string; type: 'success' | 'error' };
	}) => void;

	type Props = {
		activityId: string;
		meals: ActivityMeal[];
		addToast?: ToastFn;
	};

	let { activityId, meals = $bindable(), addToast }: Props = $props();

	let dialog: PureHtmlDialog;
	let selectedKind = $state<MealKind>(MealKind.LUNCH);
	let selectedFormat = $state<MealFormat>(MealFormat.COMPLETE);
	let selectedAdditional = $state<MealAdditional[]>([]);
	let selectedAllergens = $state<ActivityAllergen[]>([]);
	let showAllergens = $state(false);
	let isAdding = $state(false);
	let isRemoving = $state<string | null>(null);

	function showToast(type: 'success' | 'error', description: string) {
		addToast?.({ data: { title: type === 'success' ? 'Success' : 'Error', description, type } });
	}

	function toggleAdditional(value: MealAdditional) {
		if (selectedAdditional.includes(value)) {
			selectedAdditional = selectedAdditional.filter((v) => v !== value);
		} else {
			selectedAdditional = [...selectedAdditional, value];
		}
	}

	function toggleAllergen(value: ActivityAllergen) {
		if (selectedAllergens.includes(value)) {
			selectedAllergens = selectedAllergens.filter((v) => v !== value);
		} else {
			selectedAllergens = [...selectedAllergens, value];
		}
	}

	function resetForm() {
		selectedKind = MealKind.LUNCH;
		selectedFormat = MealFormat.COMPLETE;
		selectedAdditional = [];
		selectedAllergens = [];
		showAllergens = false;
	}

	function openCreateDialog() {
		resetForm();
		dialog.showModal();
	}

	async function handleAdd() {
		if (!selectedKind || !selectedFormat) return;

		isAdding = true;
		try {
			const mealId = uuidv4();
			await ACTIVITY_REQUEST.addMeal(fetch, activityId, {
				id: mealId,
				kind: selectedKind,
				format: selectedFormat,
				additionalOptions: selectedAdditional,
				allergens: selectedAllergens
			});

			meals = [
				...meals,
				{
					id: mealId,
					kind: selectedKind,
					format: selectedFormat,
					additionalOptions: selectedAdditional,
					allergens: selectedAllergens
				}
			];

			dialog.close();
			showToast('success', m.activities_mealsAdded());
		} catch (err) {
			console.error('Error adding meal:', err);
			showToast('error', m.activities_mealsError());
		} finally {
			isAdding = false;
		}
	}

	async function handleRemove(meal: ActivityMeal) {
		const confirmed = await showConfirmDialog({
			title: m.activities_confirmDeleteTitle(),
			message: m.activities_confirmDeleteMessage(),
			confirmText: m.common_delete(),
			cancelText: m.common_cancel(),
			danger: true
		});
		if (!confirmed) return;

		isRemoving = meal.id;
		try {
			await ACTIVITY_REQUEST.removeMeal(fetch, activityId, meal.id);
			meals = meals.filter((m) => m.id !== meal.id);
			showToast('success', m.activities_mealsRemoved());
		} catch (err) {
			console.error('Error removing meal:', err);
			showToast('error', m.activities_mealsError());
		} finally {
			isRemoving = null;
		}
	}

	function getMealLabel(meal: ActivityMeal): string {
		const kind = MEAL_KIND_OPTIONS.find((o) => o.id === meal.kind)?.name ?? meal.kind;
		const format = MEAL_FORMAT_OPTIONS.find((o) => o.id === meal.format)?.name ?? meal.format;
		return `${kind} — ${format}`;
	}

	function getMealTags(meal: ActivityMeal): string[] {
		return [
			...meal.additionalOptions.map(
				(a) => MEAL_ADDITIONAL_OPTIONS.find((o) => o.id === a)?.name ?? a
			),
			...meal.allergens.map((a) => ACTIVITY_ALLERGEN_OPTIONS.find((o) => o.id === a)?.name ?? a)
		];
	}
</script>

<FormAccordion name="form-activity-meals" open>
	{#snippet title()}
		<span class="text-xl">🍽</span>
		<span>{m.activities_sectionMeals()}</span>
	{/snippet}
	{#snippet asideContent()}
		<p class="text-xs">{m.activities_sectionMealsDescription()}</p>
	{/snippet}
	{#snippet content()}
		<div class="md:col-span-12">
			<button type="button" class="btn btn-outline btn-primary btn-sm" onclick={openCreateDialog}>
				<Add class="size-4" />
				{m.activities_mealsNewButton()}
			</button>
		</div>

		<!-- Meals list -->
		<div class="md:col-span-12">
			{#if meals.length === 0}
				<p class="text-base-content/50 py-4 text-center text-sm">
					{m.activities_mealsEmpty()}
				</p>
			{:else}
				<div class="space-y-2">
					{#each meals as meal (meal.id)}
						<div class="bg-base-200/50 flex items-center justify-between rounded-lg px-3 py-2">
							<div>
								<span class="font-medium">{getMealLabel(meal)}</span>
								{#if getMealTags(meal).length > 0}
									<div class="mt-1 flex flex-wrap gap-1">
										{#each getMealTags(meal) as tag (tag)}
											<span class="badge badge-ghost badge-sm">{tag}</span>
										{/each}
									</div>
								{/if}
							</div>
							<button
								type="button"
								class="btn btn-ghost btn-xs text-error hover:bg-error/10"
								disabled={isRemoving === meal.id}
								onclick={() => handleRemove(meal)}
							>
								{#if isRemoving === meal.id}
									<span class="loading loading-spinner loading-xs"></span>
								{:else}
									<Close class="size-4" />
								{/if}
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/snippet}
</FormAccordion>

<!-- Create meal dialog -->
<PureHtmlDialog bind:this={dialog} title={m.activities_mealsDialogTitle()}>
	{#snippet content()}
		<div class="space-y-4">
			<div class="grid grid-cols-2 gap-4">
				<div class="form-control">
					<label class="label text-sm" for="dialogMealKind">
						<span>{m.activities_mealsKindLabel()}</span>
					</label>
					<select id="dialogMealKind" class="select w-full" bind:value={selectedKind}>
						{#each MEAL_KIND_OPTIONS as option (option.id)}
							<option value={option.id}>{option.name}</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label class="label text-sm" for="dialogMealFormat">
						<span>{m.activities_mealsFormatLabel()}</span>
					</label>
					<select id="dialogMealFormat" class="select w-full" bind:value={selectedFormat}>
						{#each MEAL_FORMAT_OPTIONS as option (option.id)}
							<option value={option.id}>{option.name}</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- Dietary options -->
			<div>
				<p class="text-sm font-medium">{m.activities_mealsAdditionalLabel()}</p>
				<div class="mt-1 grid grid-cols-2 gap-2 md:grid-cols-3">
					{#each MEAL_ADDITIONAL_OPTIONS as option (option.id)}
						<label class="label cursor-pointer justify-start gap-2">
							<input
								type="checkbox"
								class="checkbox checkbox-sm"
								checked={selectedAdditional.includes(option.id)}
								onchange={() => toggleAdditional(option.id)}
							/>
							<span class="text-sm">{option.name}</span>
						</label>
					{/each}
				</div>
			</div>

			<!-- Allergens toggle -->
			<div>
				<label class="label cursor-pointer justify-start gap-2">
					<span class="text-sm font-medium">
						{m.activities_mealsShowAllergens()} ({selectedAllergens.length})
					</span>
					<input
						type="checkbox"
						class="toggle toggle-primary toggle-sm"
						bind:checked={showAllergens}
					/>
				</label>

				{#if showAllergens}
					<div class="mt-1 grid grid-cols-2 gap-2 md:grid-cols-3">
						{#each ACTIVITY_ALLERGEN_OPTIONS as option (option.id)}
							<label class="label cursor-pointer justify-start gap-2">
								<input
									type="checkbox"
									class="checkbox checkbox-sm"
									checked={selectedAllergens.includes(option.id)}
									onchange={() => toggleAllergen(option.id)}
								/>
								<span class="text-sm">{option.name}</span>
							</label>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/snippet}
	{#snippet actions()}
		<button type="button" class="btn btn-ghost" onclick={() => dialog.close()}>
			{m.common_cancel()}
		</button>
		<button type="button" class="btn btn-primary" disabled={isAdding} onclick={handleAdd}>
			{#if isAdding}
				<span class="loading loading-spinner loading-xs"></span>
			{/if}
			{m.activities_mealsCreateButton()}
		</button>
	{/snippet}
</PureHtmlDialog>
