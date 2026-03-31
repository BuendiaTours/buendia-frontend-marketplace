<script lang="ts">
	/**
	 * ActivityCategoriesAccordion — Manages activity ↔ category relationships.
	 * Uses direct API calls (addCategory / removeCategory) instead of form submission.
	 */
	import * as m from '$paraglide/messages';
	import { Widget, Close, Tag } from '$lib/icons/Linear';
	import { ACTIVITY_REQUEST } from '$core/activities/requests';
	import type { ActivityCategory } from '$core/activities/types';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import { showConfirmDialog } from '$lib/actions/backoffice/confirmAction';

	type ToastFn = (data: {
		data: { title: string; description: string; type: 'success' | 'error' };
	}) => void;

	type Props = {
		activityId: string;
		categories: ActivityCategory[];
		availableCategories: { id: string; name: string }[];
		addToast?: ToastFn;
	};

	let { activityId, categories = $bindable(), availableCategories, addToast }: Props = $props();

	let selectedCategoryId = $state('');
	let isAdding = $state(false);
	let isRemoving = $state<string | null>(null);

	const unassignedCategories = $derived(
		availableCategories.filter((c) => !categories.some((ac) => ac.id === c.id))
	);

	function showToast(type: 'success' | 'error', description: string) {
		addToast?.({ data: { title: type === 'success' ? 'Success' : 'Error', description, type } });
	}

	async function handleAdd() {
		if (!selectedCategoryId) return;

		isAdding = true;
		try {
			await ACTIVITY_REQUEST.addCategory(fetch, activityId, {
				categoryId: selectedCategoryId
			});

			const added = availableCategories.find((c) => c.id === selectedCategoryId);
			if (added) {
				categories = [...categories, { id: added.id, name: added.name }];
			}

			selectedCategoryId = '';
			showToast('success', m.activities_categoriesAdded());
		} catch (err) {
			console.error('Error adding category:', err);
			showToast('error', m.activities_categoriesError());
		} finally {
			isAdding = false;
		}
	}

	async function handleRemove(category: ActivityCategory) {
		const confirmed = await showConfirmDialog({
			title: m.activities_confirmDeleteTitle(),
			message: m.activities_confirmDeleteMessage(),
			confirmText: m.common_delete(),
			cancelText: m.common_cancel(),
			danger: true
		});
		if (!confirmed) return;

		isRemoving = category.id;
		try {
			await ACTIVITY_REQUEST.removeCategory(fetch, activityId, category.id);
			categories = categories.filter((c) => c.id !== category.id);
			showToast('success', m.activities_categoriesRemoved());
		} catch (err) {
			console.error('Error removing category:', err);
			showToast('error', m.activities_categoriesError());
		} finally {
			isRemoving = null;
		}
	}
</script>

<FormAccordion name="form-activity-categories" open>
	{#snippet title()}
		<Widget class="size-6" />
		<span>{m.activities_sectionCategories()}</span>
	{/snippet}
	{#snippet asideContent()}
		<p class="text-xs">{m.activities_sectionCategoriesDescription()}</p>
	{/snippet}
	{#snippet content()}
		<div class="flex items-end gap-2 md:col-span-12">
			<div class="flex-1">
				<label class="label text-sm" for="categorySelect">
					<span>{m.activities_labelCategory()}</span>
				</label>
				<select
					id="categorySelect"
					class="select w-full"
					bind:value={selectedCategoryId}
					disabled={isAdding}
				>
					<option value="" disabled>{m.activities_placeholderCategory()}</option>
					{#each unassignedCategories as category (category.id)}
						<option value={category.id}>{category.name}</option>
					{/each}
				</select>
			</div>

			<button
				type="button"
				class="btn btn-outline btn-primary btn-sm h-[42px]"
				disabled={!selectedCategoryId || isAdding}
				onclick={handleAdd}
			>
				{#if isAdding}
					<span class="loading loading-spinner loading-xs"></span>
				{:else}
					{m.activities_categoriesAddButton()}
				{/if}
			</button>
		</div>

		<div class="md:col-span-12">
			{#if categories.length === 0}
				<div class="flex flex-col items-center gap-2 py-8">
					<Tag class="text-base-content/20 size-10" />
					<p class="text-base-content/50 text-sm">{m.activities_categoriesEmpty()}</p>
				</div>
			{:else}
				<div class="mt-2 space-y-2">
					{#each categories as category (category.id)}
						<div
							class="border-neutral bg-base-200/50 flex items-center gap-3 rounded-lg border-l-4 px-3 py-2.5"
						>
							<Tag class="text-base-content/40 size-5 shrink-0" />
							<span class="min-w-0 flex-1 font-medium">{category.name}</span>
							<button
								type="button"
								class="btn btn-ghost btn-xs text-error hover:bg-error/10"
								disabled={isRemoving === category.id}
								onclick={() => handleRemove(category)}
							>
								{#if isRemoving === category.id}
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
