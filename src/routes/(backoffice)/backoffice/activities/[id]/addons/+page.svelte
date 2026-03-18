<script lang="ts">
	/**
	 * Addons tab — manages activity addons via client-side API calls.
	 */
	import type { PageProps } from './$types';
	import type { ActivityAddon } from '$core/activity-addons/types';
	import { getContext } from 'svelte';
	import ActivityAddonsAccordion from '../../components/ActivityAddonsAccordion.svelte';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	let addons: ActivityAddon[] = $state(data.addons);

	const addToast =
		getContext<
			(toast: { data: { title: string; description: string; type: 'success' | 'error' } }) => void
		>('activityToast');

	const updateAddonCount = getContext<(count: number) => void>('updateAddonCount');

	$effect(() => {
		updateAddonCount(addons.length);
	});
</script>

<div class="space-y-4">
	<ActivityAddonsAccordion activityId={data.activity.id} bind:addons {addToast} />
</div>
