<script lang="ts">
	/**
	 * ActivityLocationsAccordion — Manages activity ↔ location relationships.
	 * Uses direct API calls (addLocation / removeLocation) instead of form submission.
	 * Only functional in edit mode (the activity must exist).
	 */
	import * as m from '$paraglide/messages';
	import { v4 as uuidv4 } from 'uuid';
	import { MapPoint, Close, Map as MapIcon } from '$lib/icons/Linear';
	import { ACTIVITY_LOCATION_ROLE_OPTIONS } from '$lib/labels/activities';
	import { ActivityLocationRole, ActivityStatus } from '$core/activities/enums';
	import { ACTIVITY_REQUEST } from '$core/activities/requests';
	import type { ActivityLocation } from '$core/activities/types';
	import type { SearchResult } from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormAsyncSearch from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
	import { showConfirmDialog } from '$lib/actions/backoffice/confirmAction';
	import { searchLocations } from '../queries/location-search.queries';

	type ToastFn = (data: {
		data: { title: string; description: string; type: 'success' | 'error' };
	}) => void;

	type Props = {
		activityId: string;
		activityStatus?: ActivityStatus;
		locations: ActivityLocation[];
		addToast?: ToastFn;
		/** URL to create a new location with returnTo. */
		createLocationHref?: string;
	};

	let {
		activityId,
		activityStatus,
		locations = $bindable(),
		addToast,
		createLocationHref
	}: Props = $props();

	let selectedLocationId = $state<string | undefined>(undefined);
	let selectedRole = $state<ActivityLocationRole>(ActivityLocationRole.DESTINATION);
	let isAdding = $state(false);
	let isRemoving = $state<string | null>(null);

	// Publish invariant: a PUBLISHED activity needs at least one DESTINATION
	// location. Block removal of the last one so the user is forced to unpublish
	// before breaking the invariant. Non-DESTINATION roles can be freely removed.
	const isPublished = $derived(activityStatus === ActivityStatus.PUBLISHED);
	const destinationCount = $derived(
		locations.filter((l) => l.role === ActivityLocationRole.DESTINATION).length
	);
	function isRemovalBlocked(location: ActivityLocation): boolean {
		return (
			isPublished && location.role === ActivityLocationRole.DESTINATION && destinationCount === 1
		);
	}

	/** Cache of id → name from search results to resolve the label on add. */
	let resultCache = $state<Map<string, string>>(new Map());

	async function handleSearch(query: string): Promise<SearchResult[]> {
		const results = await searchLocations(query);
		for (const r of results) {
			resultCache.set(r.value, r.label);
		}
		return results;
	}

	function showToast(type: 'success' | 'error', description: string) {
		addToast?.({ data: { title: type === 'success' ? 'Success' : 'Error', description, type } });
	}

	async function handleAdd() {
		if (!selectedLocationId || !selectedRole) return;

		isAdding = true;
		try {
			const relationId = uuidv4();
			await ACTIVITY_REQUEST.addLocation(fetch, activityId, {
				id: relationId,
				locationId: selectedLocationId,
				role: selectedRole
			});

			locations = [
				...locations,
				{
					id: relationId,
					locationId: selectedLocationId,
					name: resultCache.get(selectedLocationId) ?? selectedLocationId,
					role: selectedRole
				}
			];

			selectedLocationId = undefined;
			selectedRole = ActivityLocationRole.DESTINATION;
			showToast('success', m.activities_locationsAdded());
		} catch (err) {
			console.error('Error adding location:', err);
			showToast('error', m.activities_locationsError());
		} finally {
			isAdding = false;
		}
	}

	async function handleRemove(location: ActivityLocation) {
		const confirmed = await showConfirmDialog({
			title: m.activities_confirmDeleteTitle(),
			message: m.activities_confirmDeleteMessage(),
			confirmText: m.common_delete(),
			cancelText: m.common_cancel(),
			danger: true
		});
		if (!confirmed) return;

		isRemoving = location.id;
		try {
			await ACTIVITY_REQUEST.removeLocation(fetch, activityId, location.locationId);
			locations = locations.filter((l) => l.id !== location.id);
			showToast('success', m.activities_locationsRemoved());
		} catch (err) {
			console.error('Error removing location:', err);
			showToast('error', m.activities_locationsError());
		} finally {
			isRemoving = null;
		}
	}
</script>

<FormAccordion name="form-activity-locations" open>
	{#snippet title()}
		<MapPoint class="size-6" />
		<span>{m.activities_sectionLocations()}</span>
	{/snippet}
	{#snippet asideContent()}
		<p class="text-xs">{m.activities_sectionLocationsDescription()}</p>
	{/snippet}
	{#snippet content()}
		<div class="flex items-end gap-2 md:col-span-12">
			<FormAsyncSearch
				id="locationSearch"
				label={m.activities_sectionLocations()}
				bind:value={selectedLocationId}
				searchFn={handleSearch}
				placeholder={m.activities_locationsSearchPlaceholder()}
				wrapperClass="min-w-0 flex-[2]"
			/>

			<div class="w-40 shrink-0">
				<label class="label text-sm" for="locationRole">
					<span>{m.activities_labelLocationRole()}</span>
				</label>
				<select id="locationRole" class="select w-full" bind:value={selectedRole}>
					{#each ACTIVITY_LOCATION_ROLE_OPTIONS as option (option.id)}
						<option value={option.id}>{option.name}</option>
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
					{m.activities_locationsAddButton()}
				{/if}
			</button>

			{#if createLocationHref}
				<a href={createLocationHref} class="btn btn-outline btn-secondary btn-sm h-[42px]">
					{m.locations_newLocation()}
				</a>
			{/if}
		</div>

		<div class="md:col-span-12">
			{#if locations.length === 0}
				<div class="flex flex-col items-center gap-2 py-8">
					<MapIcon class="text-base-content/20 size-10" />
					<p class="text-base-content/50 text-sm">{m.activities_locationsEmpty()}</p>
				</div>
			{:else}
				<div class="mt-2 space-y-2">
					{#each locations as location (location.id)}
						<div
							class="border-neutral bg-base-200/50 flex items-center gap-3 rounded-lg border-l-4 px-3 py-2.5"
						>
							<MapPoint class="text-base-content/40 size-5 shrink-0" />
							<div class="min-w-0 flex-1">
								<span class="font-medium">{location.name}</span>
								<p class="text-base-content/50 text-xs">
									{ACTIVITY_LOCATION_ROLE_OPTIONS.find((r) => r.id === location.role)?.name ??
										location.role}
								</p>
							</div>
							<div
								class={isRemovalBlocked(location) ? 'tooltip tooltip-left' : ''}
								data-tip={isRemovalBlocked(location)
									? m.activities_locationsRemoveBlockedTooltip()
									: ''}
							>
								<button
									type="button"
									class="btn btn-ghost btn-xs text-error hover:bg-error/10"
									disabled={isRemoving === location.id || isRemovalBlocked(location)}
									onclick={() => handleRemove(location)}
								>
									{#if isRemoving === location.id}
										<span class="loading loading-spinner loading-xs"></span>
									{:else}
										<Close class="size-4" />
									{/if}
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/snippet}
</FormAccordion>
