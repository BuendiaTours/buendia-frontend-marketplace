<script lang="ts">
	/**
	 * DistributiveAttractionsAccordion — Manages distributive ↔ attraction relationships.
	 * Uses direct API calls (addAttraction / removeAttraction) instead of form submission.
	 */
	import * as m from '$paraglide/messages';
	import { FolderCheck, Close, MapPoint } from '$lib/icons/Linear';
	import { DISTRIBUTIVE_REQUEST } from '$core/distributives/requests';
	import type { DistributiveAttraction } from '$core/distributives/types';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import { showConfirmDialog } from '$lib/actions/backoffice/confirmAction';

	type ToastFn = (data: {
		data: { title: string; description: string; type: 'success' | 'error' };
	}) => void;

	type Props = {
		distributiveId: string;
		attractions: DistributiveAttraction[];
		availableAttractions: { id: string; name: string }[];
		addToast?: ToastFn;
	};

	let {
		distributiveId,
		attractions = $bindable(),
		availableAttractions,
		addToast
	}: Props = $props();

	let selectedAttractionId = $state('');
	let isAdding = $state(false);
	let isRemoving = $state<string | null>(null);

	const unassignedAttractions = $derived(
		availableAttractions.filter((a) => !attractions.some((da) => da.id === a.id))
	);

	function showToast(type: 'success' | 'error', description: string) {
		addToast?.({ data: { title: type === 'success' ? 'Success' : 'Error', description, type } });
	}

	async function handleAdd() {
		if (!selectedAttractionId) return;

		isAdding = true;
		try {
			await DISTRIBUTIVE_REQUEST.addAttraction(fetch, distributiveId, {
				attractionId: selectedAttractionId
			});

			const added = availableAttractions.find((a) => a.id === selectedAttractionId);
			if (added) {
				attractions = [
					...attractions,
					{
						id: added.id,
						name: added.name,
						description: null,
						descriptionLong: null,
						locationIds: []
					}
				];
			}

			selectedAttractionId = '';
			showToast('success', m.distributives_attractionsAdded());
		} catch (err) {
			console.error('Error adding attraction:', err);
			showToast('error', m.distributives_attractionsError());
		} finally {
			isAdding = false;
		}
	}

	async function handleRemove(attraction: DistributiveAttraction) {
		const confirmed = await showConfirmDialog({
			title: m.distributives_confirmRemoveTitle(),
			message: m.distributives_confirmRemoveMessage(),
			confirmText: m.common_delete(),
			cancelText: m.common_cancel(),
			danger: true
		});
		if (!confirmed) return;

		isRemoving = attraction.id;
		try {
			await DISTRIBUTIVE_REQUEST.removeAttraction(fetch, distributiveId, attraction.id);
			attractions = attractions.filter((a) => a.id !== attraction.id);
			showToast('success', m.distributives_attractionsRemoved());
		} catch (err) {
			console.error('Error removing attraction:', err);
			showToast('error', m.distributives_attractionsError());
		} finally {
			isRemoving = null;
		}
	}
</script>

<FormAccordion name="form-distributive-attractions" open>
	{#snippet title()}
		<FolderCheck class="size-6" />
		<span>{m.distributives_sectionAttractions()}</span>
	{/snippet}
	{#snippet asideContent()}
		<p class="text-xs">{m.distributives_sectionAttractionsDescription()}</p>
	{/snippet}
	{#snippet content()}
		<div class="flex items-end gap-2 md:col-span-12">
			<div class="flex-1">
				<label class="label text-sm" for="attractionSelect">
					<span>{m.distributives_labelAttraction()}</span>
				</label>
				<select
					id="attractionSelect"
					class="select w-full"
					bind:value={selectedAttractionId}
					disabled={isAdding}
				>
					<option value="" disabled>{m.distributives_placeholderAttraction()}</option>
					{#each unassignedAttractions as attraction (attraction.id)}
						<option value={attraction.id}>{attraction.name}</option>
					{/each}
				</select>
			</div>

			<button
				type="button"
				class="btn btn-outline btn-primary btn-sm h-[42px]"
				disabled={!selectedAttractionId || isAdding}
				onclick={handleAdd}
			>
				{#if isAdding}
					<span class="loading loading-spinner loading-xs"></span>
				{:else}
					{m.distributives_attractionsAddButton()}
				{/if}
			</button>
		</div>

		<div class="md:col-span-12">
			{#if attractions.length === 0}
				<div class="flex flex-col items-center gap-2 py-8">
					<MapPoint class="text-base-content/20 size-10" />
					<p class="text-base-content/50 text-sm">{m.distributives_attractionsEmpty()}</p>
				</div>
			{:else}
				<div class="mt-2 space-y-2">
					{#each attractions as attraction (attraction.id)}
						<div
							class="border-neutral bg-base-200/50 flex items-center gap-3 rounded-lg border-l-4 px-3 py-2.5"
						>
							<MapPoint class="text-base-content/40 size-5 shrink-0" />
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
