<script lang="ts">
	/**
	 * DistributiveLocationsAccordion — Manages distributive ↔ location relationships.
	 * Uses direct API calls (addLocation / removeLocation) instead of form submission.
	 * All locations are added with the DESTINATION role.
	 */
	import * as m from '$paraglide/messages';
	import { Map, Close, MapPoint } from '$lib/icons/Linear';
	import { DISTRIBUTIVE_REQUEST } from '$core/distributives/requests';
	import { DistributiveLocationRole } from '$core/distributives/enums';
	import type { DistributiveLocation } from '$core/distributives/types';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import { showConfirmDialog } from '$lib/actions/backoffice/confirmAction';

	type ToastFn = (data: {
		data: { title: string; description: string; type: 'success' | 'error' };
	}) => void;

	type Props = {
		distributiveId: string;
		locations: DistributiveLocation[];
		availableLocations: { id: string; name: string }[];
		addToast?: ToastFn;
	};

	let { distributiveId, locations = $bindable(), availableLocations, addToast }: Props = $props();

	let selectedLocationId = $state('');
	let isAdding = $state(false);
	let isRemoving = $state<string | null>(null);

	const unassignedLocations = $derived(
		availableLocations.filter((l) => !locations.some((dl) => dl.locationId === l.id))
	);

	function showToast(type: 'success' | 'error', description: string) {
		addToast?.({ data: { title: type === 'success' ? 'Success' : 'Error', description, type } });
	}

	async function handleAdd() {
		if (!selectedLocationId) return;

		isAdding = true;
		try {
			const entityId = crypto.randomUUID();

			await DISTRIBUTIVE_REQUEST.addLocation(fetch, distributiveId, {
				id: entityId,
				locationId: selectedLocationId,
				role: DistributiveLocationRole.DESTINATION
			});

			const added = availableLocations.find((l) => l.id === selectedLocationId);
			if (added) {
				locations = [
					...locations,
					{
						id: entityId,
						locationId: added.id,
						name: added.name,
						role: DistributiveLocationRole.DESTINATION
					}
				];
			}

			selectedLocationId = '';
			showToast('success', m.distributives_locationsAdded());
		} catch (err) {
			console.error('Error adding location:', err);
			showToast('error', m.distributives_locationsError());
		} finally {
			isAdding = false;
		}
	}

	async function handleRemove(location: DistributiveLocation) {
		const confirmed = await showConfirmDialog({
			title: m.distributives_confirmRemoveTitle(),
			message: m.distributives_confirmRemoveMessage(),
			confirmText: m.common_delete(),
			cancelText: m.common_cancel(),
			danger: true
		});
		if (!confirmed) return;

		isRemoving = location.id;
		try {
			await DISTRIBUTIVE_REQUEST.removeLocation(fetch, distributiveId, location.id);
			locations = locations.filter((l) => l.id !== location.id);
			showToast('success', m.distributives_locationsRemoved());
		} catch (err) {
			console.error('Error removing location:', err);
			showToast('error', m.distributives_locationsError());
		} finally {
			isRemoving = null;
		}
	}
</script>

<FormAccordion name="form-distributive-locations" open>
	{#snippet title()}
		<Map class="size-6" />
		<span>{m.distributives_sectionLocations()}</span>
	{/snippet}
	{#snippet asideContent()}
		<p class="text-xs">{m.distributives_sectionLocationsDescription()}</p>
	{/snippet}
	{#snippet content()}
		<div class="flex items-end gap-2 md:col-span-12">
			<div class="flex-1">
				<label class="label text-sm" for="locationSelect">
					<span>{m.distributives_labelLocation()}</span>
				</label>
				<select
					id="locationSelect"
					class="select w-full"
					bind:value={selectedLocationId}
					disabled={isAdding}
				>
					<option value="" disabled>{m.distributives_placeholderLocation()}</option>
					{#each unassignedLocations as location (location.id)}
						<option value={location.id}>{location.name}</option>
					{/each}
				</select>
			</div>

			<button
				type="button"
				class="btn btn-outline btn-primary btn-sm h-[42px]"
				disabled={!selectedLocationId || isAdding}
				onclick={handleAdd}
			>
				{#if isAdding}
					<span class="loading loading-spinner loading-xs"></span>
				{:else}
					{m.distributives_locationsAddButton()}
				{/if}
			</button>
		</div>

		<div class="md:col-span-12">
			{#if locations.length === 0}
				<div class="flex flex-col items-center gap-2 py-8">
					<MapPoint class="text-base-content/20 size-10" />
					<p class="text-base-content/50 text-sm">{m.distributives_locationsEmpty()}</p>
				</div>
			{:else}
				<div class="mt-2 space-y-2">
					{#each locations as location (location.id)}
						<div
							class="border-neutral bg-base-200/50 flex items-center gap-3 rounded-lg border-l-4 px-3 py-2.5"
						>
							<MapPoint class="text-base-content/40 size-5 shrink-0" />
							<span class="min-w-0 flex-1 font-medium">{location.name}</span>
							<button
								type="button"
								class="btn btn-ghost btn-xs text-error hover:bg-error/10"
								disabled={isRemoving === location.id}
								onclick={() => handleRemove(location)}
							>
								{#if isRemoving === location.id}
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
