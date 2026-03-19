<script lang="ts">
	/**
	 * Stages tab — manages activity itinerary stages via client-side API calls.
	 */
	import type { PageProps } from './$types';
	import { getContext } from 'svelte';
	import ActivityStagesAccordion from '../../components/ActivityStagesAccordion.svelte';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	let stages = $state(data.stages);

	const addToast =
		getContext<
			(toast: { data: { title: string; description: string; type: 'success' | 'error' } }) => void
		>('activityToast');

	const updateStageCount = getContext<(count: number) => void>('updateStageCount');

	$effect(() => {
		updateStageCount(stages.length);
	});
</script>

<div class="space-y-4">
	<ActivityStagesAccordion activityId={data.activity.id} bind:stages {addToast} />
</div>
