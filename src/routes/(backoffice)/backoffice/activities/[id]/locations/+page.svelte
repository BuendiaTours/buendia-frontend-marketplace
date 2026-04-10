<script lang="ts">
	/**
	 * Locations tab — manages activity locations, attractions, and itinerary stages
	 * via client-side API calls.
	 * Supports auto-add when returning from location/attraction creation.
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { v4 as uuidv4 } from 'uuid';
	import { ACTIVITY_REQUEST } from '$core/activities/requests';
	import { ActivityLocationRole } from '$core/activities/enums';
	import { ACTIVITY_ROUTES } from '$lib/config/routes/backoffice/activities';
	import ActivityLocationsAccordion from '../../components/ActivityLocationsAccordion.svelte';
	import ActivityAttractionsAccordion from '../../components/ActivityAttractionsAccordion.svelte';
	import ActivityStagesAccordion from '../../components/ActivityStagesAccordion.svelte';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	let locations = $state(data.locations);
	// svelte-ignore state_referenced_locally
	let attractions = $state(data.attractions);
	// svelte-ignore state_referenced_locally
	let stages = $state(data.stages);

	const addToast =
		getContext<
			(toast: { data: { title: string; description: string; type: 'success' | 'error' } }) => void
		>('activityToast');

	const returnToUrl = $derived(ACTIVITY_ROUTES.locations(data.activity.id));

	const createLocationHref = $derived(
		`/backoffice/locations/create?returnTo=${encodeURIComponent(returnToUrl)}`
	);
	const createAttractionHref = $derived(
		`/backoffice/attractions/create?returnTo=${encodeURIComponent(returnToUrl)}`
	);

	function showToast(type: 'success' | 'error', description: string) {
		addToast?.({ data: { title: type === 'success' ? '✓' : '✗', description, type } });
	}

	// ── Auto-add location ──────────────────────────
	let isAutoAddingLocation = $state(false);
	let autoAddLocationDone = $state(false);

	async function autoAddPendingLocation() {
		if (!data.pendingLocation) return;

		const loc = data.pendingLocation;
		const alreadyAdded = locations.some((l) => l.locationId === loc.id);

		if (alreadyAdded) {
			goto(returnToUrl, { replaceState: true, noScroll: true });
			return;
		}

		isAutoAddingLocation = true;
		try {
			const relationId = uuidv4();
			await ACTIVITY_REQUEST.addLocation(globalThis.fetch, data.activity.id, {
				id: relationId,
				locationId: loc.id,
				role: ActivityLocationRole.DESTINATION
			});

			locations = [
				...locations,
				{
					id: relationId,
					locationId: loc.id,
					name: loc.name,
					role: ActivityLocationRole.DESTINATION
				}
			];

			showToast('success', m.activities_locationsAdded());
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && err.status === 409) {
				if (!locations.some((l) => l.locationId === loc.id)) {
					locations = [
						...locations,
						{
							id: uuidv4(),
							locationId: loc.id,
							name: loc.name,
							role: ActivityLocationRole.DESTINATION
						}
					];
				}
			} else {
				console.error('Error auto-adding location:', err);
				showToast('error', m.activities_locationsError());
			}
		} finally {
			isAutoAddingLocation = false;
			autoAddLocationDone = true;
			goto(returnToUrl, { replaceState: true, noScroll: true });
		}
	}

	$effect(() => {
		if (data.pendingLocation && !autoAddLocationDone && !isAutoAddingLocation) {
			autoAddPendingLocation();
		}
	});

	// ── Auto-add attraction ────────────────────────
	let isAutoAddingAttraction = $state(false);
	let autoAddAttractionDone = $state(false);

	async function autoAddPendingAttraction() {
		if (!data.pendingAttraction) return;

		const attr = data.pendingAttraction;
		const alreadyAdded = attractions.some((a) => a.id === attr.id);

		if (alreadyAdded) {
			goto(returnToUrl, { replaceState: true, noScroll: true });
			return;
		}

		isAutoAddingAttraction = true;
		try {
			await ACTIVITY_REQUEST.addAttraction(globalThis.fetch, data.activity.id, {
				attractionId: attr.id
			});

			attractions = [...attractions, { id: attr.id, name: attr.name }];

			showToast('success', m.activities_attractionsAdded());
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && err.status === 409) {
				if (!attractions.some((a) => a.id === attr.id)) {
					attractions = [...attractions, { id: attr.id, name: attr.name }];
				}
			} else {
				console.error('Error auto-adding attraction:', err);
				showToast('error', m.activities_attractionsError());
			}
		} finally {
			isAutoAddingAttraction = false;
			autoAddAttractionDone = true;
			goto(returnToUrl, { replaceState: true, noScroll: true });
		}
	}

	$effect(() => {
		if (data.pendingAttraction && !autoAddAttractionDone && !isAutoAddingAttraction) {
			autoAddPendingAttraction();
		}
	});
</script>

<div class="space-y-4">
	<ActivityLocationsAccordion
		activityId={data.activity.id}
		bind:locations
		{addToast}
		{createLocationHref}
	/>

	<ActivityAttractionsAccordion
		activityId={data.activity.id}
		bind:attractions
		{addToast}
		{createAttractionHref}
	/>

	<ActivityStagesAccordion activityId={data.activity.id} bind:stages {addToast} />
</div>
