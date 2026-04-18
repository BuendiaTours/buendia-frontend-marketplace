<script lang="ts">
	/**
	 * Options tab — manages activity options via client-side API calls.
	 */
	import type { PageProps } from './$types';
	import type { ActivityOption } from '$core/activity-options/types';
	import { getContext } from 'svelte';
	import ActivityOptionsAccordion from '../../components/ActivityOptionsAccordion.svelte';

	let { data }: PageProps = $props();

	let options: ActivityOption[] = $derived(data.options);

	const addToast =
		getContext<
			(toast: { data: { title: string; description: string; type: 'success' | 'error' } }) => void
		>('activityToast');

	const updateOptionCount = getContext<(count: number) => void>('updateOptionCount');

	$effect(() => {
		updateOptionCount(options.length);
	});
</script>

<div class="space-y-4">
	<ActivityOptionsAccordion
		activityId={data.activity.id}
		activityKind={data.activity.kind}
		bind:options
		{addToast}
	/>
</div>
