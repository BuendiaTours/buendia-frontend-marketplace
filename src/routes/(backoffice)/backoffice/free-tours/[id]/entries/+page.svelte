<script lang="ts">
	/**
	 * Entries tab — manages the activity entries linked to this aggregation.
	 * Entries can be multiple; each activity is uniquely linked to this aggregation.
	 */
	import type { PageProps } from './$types';
	import { getContext } from 'svelte';
	import FreeTourEntriesAccordion from '../../components/FreeTourEntriesAccordion.svelte';

	let { data }: PageProps = $props();

	let entries = $derived(data.entries);

	const addToast =
		getContext<
			(toast: { data: { title: string; description: string; type: 'success' | 'error' } }) => void
		>('freeTourToast');
</script>

<FreeTourEntriesAccordion
	freeTourId={data.freeTour.id}
	freeTourStatus={data.freeTour.status}
	bind:entries
	availableActivities={data.availableActivities}
	{addToast}
/>
