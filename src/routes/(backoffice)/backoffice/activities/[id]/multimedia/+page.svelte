<script lang="ts">
	/**
	 * Multimedia tab — manages images linked to the activity via media relationships.
	 * Order matters: determines display order in the marketplace.
	 */
	import type { PageProps } from './$types';
	import { getContext } from 'svelte';
	import ActivityMultimediaAccordion from '../../components/ActivityMultimediaAccordion.svelte';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	let images = $state(data.images);

	const addToast =
		getContext<
			(toast: { data: { title: string; description: string; type: 'success' | 'error' } }) => void
		>('activityToast');

	const updateImageCount = getContext<(count: number) => void>('updateImageCount');

	$effect(() => {
		updateImageCount(images.length);
	});
</script>

<ActivityMultimediaAccordion activityId={data.activity.id} bind:images {addToast} />
