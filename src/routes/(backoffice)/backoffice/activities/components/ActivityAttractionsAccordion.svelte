<script lang="ts">
	/**
	 * ActivityAttractionsAccordion — Manages activity ↔ attraction relationships.
	 * Uses direct API calls (addAttraction / removeAttraction) instead of form submission.
	 */
	import * as m from '$paraglide/messages';
	import { MapPoint, Close, Compass } from '$lib/icons/Linear';
	import { ACTIVITY_REQUEST } from '$core/activities/requests';
	import type { ActivityAttraction } from '$core/activities/types';
	import type { SearchResult } from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormAsyncSearch from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
	import { showConfirmDialog } from '$lib/actions/backoffice/confirmAction';
	import { searchAttractions } from '../queries/attraction-search.queries';

	type ToastFn = (data: {
		data: { title: string; description: string; type: 'success' | 'error' };
	}) => void;

	type Props = {
		activityId: string;
		attractions: ActivityAttraction[];
		addToast?: ToastFn;
	};

	let { activityId, attractions = $bindable(), addToast }: Props = $props();

	let selectedAttractionId = $state<string | undefined>(undefined);
	let isAdding = $state(false);
	let isRemoving = $state<string | null>(null);

	let resultCache = $state<Map<string, string>>(new Map());

	async function handleSearch(query: string): Promise<SearchResult[]> {
		const results = await searchAttractions(query);
		for (const r of results) {
			resultCache.set(r.value, r.label);
		}
		return results;
	}

	function showToast(type: 'success' | 'error', description: string) {
		addToast?.({ data: { title: type === 'success' ? 'Success' : 'Error', description, type } });
	}

	async function handleAdd() {
		if (!selectedAttractionId) return;

		isAdding = true;
		try {
			await ACTIVITY_REQUEST.addAttraction(fetch, activityId, {
				attractionId: selectedAttractionId
			});

			attractions = [
				...attractions,
				{
					id: selectedAttractionId,
					name: resultCache.get(selectedAttractionId) ?? selectedAttractionId
				}
			];

			selectedAttractionId = undefined;
			showToast('success', m.activities_attractionsAdded());
		} catch (err) {
			console.error('Error adding attraction:', err);
			showToast('error', m.activities_attractionsError());
		} finally {
			isAdding = false;
		}
	}

	async function handleRemove(attraction: ActivityAttraction) {
		const confirmed = await showConfirmDialog({
			title: m.activities_confirmDeleteTitle(),
			message: m.activities_confirmDeleteMessage(),
			confirmText: m.common_delete(),
			cancelText: m.common_cancel(),
			danger: true
		});
		if (!confirmed) return;

		isRemoving = attraction.id;
		try {
			await ACTIVITY_REQUEST.removeAttraction(fetch, activityId, attraction.id);
			attractions = attractions.filter((a) => a.id !== attraction.id);
			showToast('success', m.activities_attractionsRemoved());
		} catch (err) {
			console.error('Error removing attraction:', err);
			showToast('error', m.activities_attractionsError());
		} finally {
			isRemoving = null;
		}
	}
</script>

<FormAccordion name="form-activity-attractions" open>
	{#snippet title()}
		<MapPoint class="size-6" />
		<span>{m.activities_sectionAttractions()}</span>
	{/snippet}
	{#snippet asideContent()}
		<p class="text-xs">{m.activities_sectionAttractionsDescription()}</p>
	{/snippet}
	{#snippet content()}
		<div class="flex items-end gap-2 md:col-span-12">
			<FormAsyncSearch
				id="attractionSearch"
				label={m.activities_sectionAttractions()}
				bind:value={selectedAttractionId}
				searchFn={handleSearch}
				placeholder={m.activities_attractionsSearchPlaceholder()}
				wrapperClass="flex-1"
			/>

			<button
				type="button"
				class="btn btn-outline btn-primary btn-sm h-[42px]"
				disabled={!selectedAttractionId || isAdding}
				onclick={handleAdd}
			>
				{#if isAdding}
					<span class="loading loading-spinner loading-xs"></span>
				{:else}
					{m.activities_attractionsAddButton()}
				{/if}
			</button>
		</div>

		<div class="md:col-span-12">
			{#if attractions.length === 0}
				<div class="flex flex-col items-center gap-2 py-8">
					<Compass class="text-base-content/20 size-10" />
					<p class="text-base-content/50 text-sm">{m.activities_attractionsEmpty()}</p>
				</div>
			{:else}
				<div class="mt-2 space-y-2">
					{#each attractions as attraction (attraction.id)}
						<div
							class="border-neutral bg-base-200/50 flex items-center gap-3 rounded-lg border-l-4 px-3 py-2.5"
						>
							<Compass class="text-base-content/40 size-5 shrink-0" />
							<span class="min-w-0 flex-1 font-medium">{attraction.name}</span>
							<button
								type="button"
								class="btn btn-ghost btn-xs text-error hover:bg-error/10"
								disabled={isRemoving === attraction.id}
								onclick={() => handleRemove(attraction)}
							>
								{#if isRemoving === attraction.id}
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
