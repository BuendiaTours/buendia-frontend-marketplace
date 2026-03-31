<script lang="ts">
	/**
	 * Locations tab — manages activity locations, attractions, and itinerary stages
	 * via client-side API calls.
	 */
	import type { PageProps } from './$types';
	import { getContext } from 'svelte';
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
</script>

<div class="space-y-4">
	<ActivityLocationsAccordion activityId={data.activity.id} bind:locations {addToast} />

	<ActivityAttractionsAccordion activityId={data.activity.id} bind:attractions {addToast} />

	<ActivityStagesAccordion activityId={data.activity.id} bind:stages {addToast} />
</div>
