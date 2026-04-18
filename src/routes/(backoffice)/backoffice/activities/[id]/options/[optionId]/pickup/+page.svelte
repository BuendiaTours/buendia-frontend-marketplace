<script lang="ts">
	/**
	 * Pickup tab — manages pickup/dropoff places for an activity option.
	 * Uses a search over global pickup points and client-side API calls to add/remove.
	 * Supports auto-add flow: when returning from pickup point creation with
	 * `addPickupPointId` query param, automatically adds the new point.
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import type { PickupPlace } from '$core/activity-options/types';
	import type { SearchResult } from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { PickupPlaceKind } from '$core/activity-options/enums';
	import { ACTIVITY_OPTION_REQUEST } from '$core/activity-options/requests';
	import { ACTIVITY_ROUTES } from '$lib/config/routes/backoffice/activities';
	import { PICKUP_PLACE_KIND_OPTIONS } from '$lib/labels/activityOptions';
	import { searchPickupPoints } from '../../../../queries/pickup-point-search.queries';
	import { showConfirmDialog } from '$lib/actions/backoffice/confirmAction';
	import { MapPoint, Close, Add } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormAsyncSearch from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';

	let { data }: PageProps = $props();

	const addToast =
		getContext<
			(toast: { data: { title: string; description: string; type: 'success' | 'error' } }) => void
		>('activityToast');

	const updatePickupCount = getContext<(count: number) => void>('updatePickupCount');

	let pickupPlaces: PickupPlace[] = $derived(data.option.pickupPlaces ?? []);

	$effect(() => {
		updatePickupCount(pickupPlaces.length);
	});

	let selectedPickupPointId = $state<string | undefined>(undefined);
	let selectedKind = $state<PickupPlaceKind>(PickupPlaceKind.PICKUP);
	let selectedMinutesBefore = $state<number | undefined>(undefined);
	let isAdding = $state(false);
	let isRemoving = $state<string | null>(null);

	let resultCache = $state<
		Map<string, { name: string; address: string | null; city: string | null }>
	>(new Map());

	const returnToUrl = $derived(ACTIVITY_ROUTES.optionPickup(data.activity.id, data.option.id));

	const createPickupPointHref = $derived(
		`/backoffice/pickup-points/create?returnTo=${encodeURIComponent(returnToUrl)}`
	);

	/** Auto-add pickup point when returning from creation page. */
	async function autoAddPendingPickupPoint() {
		if (!data.pendingPickupPoint) return;

		const pp = data.pendingPickupPoint;
		const alreadyAdded = pickupPlaces.some((p) => p.pickupPointId === pp.id);
		if (alreadyAdded) return;

		isAdding = true;
		try {
			await ACTIVITY_OPTION_REQUEST.addPickupPlace(fetch, data.option.id, {
				pickupLocationId: pp.id,
				kind: PickupPlaceKind.PICKUP
			});

			pickupPlaces = [
				...pickupPlaces,
				{
					pickupPointId: pp.id,
					name: pp.name,
					address: pp.address,
					city: pp.city,
					coords: pp.coords,
					countryCode: pp.countryCode,
					kind: PickupPlaceKind.PICKUP,
					minutesBefore: null,
					postCode: pp.postCode
				}
			];

			showToast('success', m.activities_optionPickupAdded());
		} catch (err) {
			console.error('Error auto-adding pickup point:', err);
			showToast('error', m.activities_optionPickupError());
		} finally {
			isAdding = false;
			// Clean the query param from the URL
			goto(returnToUrl, { replaceState: true, noScroll: true });
		}
	}

	$effect(() => {
		if (data.pendingPickupPoint) {
			autoAddPendingPickupPoint();
		}
	});

	async function handleSearch(query: string): Promise<SearchResult[]> {
		const results = await searchPickupPoints(query);
		for (const r of results) {
			resultCache.set(r.value, { name: r.label, address: r.address, city: r.city });
		}
		return results;
	}

	function showToast(type: 'success' | 'error', description: string) {
		addToast?.({ data: { title: type === 'success' ? 'Success' : 'Error', description, type } });
	}

	async function handleAdd() {
		if (!selectedPickupPointId) return;

		isAdding = true;
		try {
			await ACTIVITY_OPTION_REQUEST.addPickupPlace(fetch, data.option.id, {
				pickupLocationId: selectedPickupPointId,
				kind: selectedKind,
				...(selectedMinutesBefore ? { minutesBefore: selectedMinutesBefore } : {})
			});

			const cached = resultCache.get(selectedPickupPointId);
			pickupPlaces = [
				...pickupPlaces,
				{
					pickupPointId: selectedPickupPointId,
					name: cached?.name ?? selectedPickupPointId,
					address: cached?.address ?? null,
					city: cached?.city ?? null,
					coords: null,
					countryCode: null,
					kind: selectedKind,
					minutesBefore: selectedMinutesBefore ?? null,
					postCode: null
				}
			];

			selectedPickupPointId = undefined;
			selectedKind = PickupPlaceKind.PICKUP;
			selectedMinutesBefore = undefined;
			showToast('success', m.activities_optionPickupAdded());
		} catch (err) {
			console.error('Error adding pickup place:', err);
			showToast('error', m.activities_optionPickupError());
		} finally {
			isAdding = false;
		}
	}

	async function handleRemove(place: PickupPlace) {
		const confirmed = await showConfirmDialog({
			title: m.activities_confirmDeleteTitle(),
			message: m.activities_confirmDeleteMessage(),
			confirmText: m.common_delete(),
			cancelText: m.common_cancel(),
			danger: true
		});
		if (!confirmed) return;

		isRemoving = place.pickupPointId;
		try {
			await ACTIVITY_OPTION_REQUEST.removePickupPlace(
				fetch,
				data.option.id,
				place.pickupPointId,
				place.kind
			);
			pickupPlaces = pickupPlaces.filter(
				(p) => !(p.pickupPointId === place.pickupPointId && p.kind === place.kind)
			);
			showToast('success', m.activities_optionPickupRemoved());
		} catch (err) {
			console.error('Error removing pickup place:', err);
			showToast('error', m.activities_optionPickupError());
		} finally {
			isRemoving = null;
		}
	}
</script>

<div class="space-y-4">
	<FormAccordion name="form-option-pickup" open>
		{#snippet title()}
			<MapPoint class="size-6" />
			<span>{m.activities_optionSectionPickup()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.activities_optionSectionPickupDescription()}</p>
		{/snippet}
		{#snippet content()}
			<div class="flex items-end gap-2 md:col-span-12">
				<FormAsyncSearch
					id="pickupPointSearch"
					label={m.activities_optionSectionPickup()}
					bind:value={selectedPickupPointId}
					searchFn={handleSearch}
					placeholder={m.activities_optionPickupSearchPlaceholder()}
					wrapperClass="flex-1"
				/>

				<select class="select select-sm h-[42px]" bind:value={selectedKind}>
					{#each PICKUP_PLACE_KIND_OPTIONS as option (option.id)}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>

				<input
					type="number"
					class="input input-sm h-[42px] w-24"
					placeholder={m.activities_optionPickupMinutesBeforePlaceholder()}
					bind:value={selectedMinutesBefore}
					min="0"
				/>

				<button
					type="button"
					class="btn btn-outline btn-primary btn-sm h-[42px]"
					disabled={!selectedPickupPointId || isAdding}
					onclick={handleAdd}
				>
					{#if isAdding}
						<span class="loading loading-spinner loading-xs"></span>
					{:else}
						{m.activities_optionPickupAddButton()}
					{/if}
				</button>
			</div>

			<div class="md:col-span-12">
				<a href={createPickupPointHref} class="btn btn-ghost btn-xs gap-1">
					<Add class="size-3.5" />
					{m.activities_optionPickupCreateNew()}
				</a>
			</div>

			<div class="md:col-span-12">
				{#if pickupPlaces.length === 0}
					<div class="flex flex-col items-center gap-2 py-8">
						<MapPoint class="text-base-content/20 size-10" />
						<p class="text-base-content/50 text-sm">{m.activities_optionPickupEmpty()}</p>
					</div>
				{:else}
					<div class="space-y-2">
						{#each pickupPlaces as place (place.pickupPointId + place.kind)}
							<div
								class="border-neutral bg-base-200/50 flex items-center gap-3 rounded-lg border-l-4 px-3 py-2.5"
							>
								<MapPoint class="text-base-content/40 size-5 shrink-0" />
								<div class="min-w-0 flex-1">
									<span class="font-medium">{place.name}</span>
									<p class="text-base-content/50 text-xs">
										{PICKUP_PLACE_KIND_OPTIONS.find((k) => k.id === place.kind)?.name ?? place.kind}
										{#if place.minutesBefore}
											· {m.activities_optionPickupMinutesSuffix({ minutes: place.minutesBefore })}
										{/if}
										{#if place.address || place.city}
											· {[place.address, place.city].filter(Boolean).join(', ')}
										{/if}
									</p>
								</div>
								<button
									type="button"
									class="btn btn-ghost btn-xs text-error hover:bg-error/10"
									disabled={isRemoving === place.pickupPointId}
									onclick={() => handleRemove(place)}
								>
									{#if isRemoving === place.pickupPointId}
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
</div>
