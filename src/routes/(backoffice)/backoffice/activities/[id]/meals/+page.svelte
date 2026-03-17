<script lang="ts">
	/**
	 * Meals tab — manages activity meals via client-side API calls.
	 */
	import type { PageProps } from './$types';
	import { getContext } from 'svelte';
	import ActivityMealsAccordion from '../../components/ActivityMealsAccordion.svelte';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	let meals = $state(data.meals);

	const addToast =
		getContext<
			(toast: { data: { title: string; description: string; type: 'success' | 'error' } }) => void
		>('activityToast');
</script>

<div class="space-y-4">
	<ActivityMealsAccordion activityId={data.activity.id} bind:meals {addToast} />
</div>
