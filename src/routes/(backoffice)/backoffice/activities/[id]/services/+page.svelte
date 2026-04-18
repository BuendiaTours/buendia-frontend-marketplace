<script lang="ts">
	/**
	 * Services tab — manages meals and addons linked to the activity
	 * via client-side API calls.
	 */
	import type { PageProps } from './$types';
	import type { ActivityAddon } from '$core/activity-addons/types';
	import { getContext } from 'svelte';
	import ActivityMealsAccordion from '../../components/ActivityMealsAccordion.svelte';
	import ActivityAddonsAccordion from '../../components/ActivityAddonsAccordion.svelte';

	let { data }: PageProps = $props();

	let meals = $derived(data.meals);
	let addons: ActivityAddon[] = $derived(data.addons);

	const addToast =
		getContext<
			(toast: { data: { title: string; description: string; type: 'success' | 'error' } }) => void
		>('activityToast');
</script>

<div class="space-y-4">
	<ActivityMealsAccordion activityId={data.activity.id} bind:meals {addToast} />

	<ActivityAddonsAccordion activityId={data.activity.id} bind:addons {addToast} />
</div>
