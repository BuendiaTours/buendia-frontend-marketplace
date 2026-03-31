<script lang="ts">
	/**
	 * Classification tab — manages activity categories and tags.
	 */
	import type { PageProps } from './$types';
	import { getContext } from 'svelte';
	import ActivityCategoriesAccordion from '../../components/ActivityCategoriesAccordion.svelte';
	import ActivityTagsAccordion from '../../components/ActivityTagsAccordion.svelte';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	let categories = $state(data.activity.categories ?? []);
	// svelte-ignore state_referenced_locally
	let tags = $state(data.activityTags);

	const addToast =
		getContext<
			(toast: { data: { title: string; description: string; type: 'success' | 'error' } }) => void
		>('activityToast');

	const updateClassificationCount = getContext<(count: number) => void>(
		'updateClassificationCount'
	);

	$effect(() => {
		updateClassificationCount(categories.length + tags.length);
	});
</script>

<div class="space-y-4">
	<ActivityCategoriesAccordion
		activityId={data.activity.id}
		bind:categories
		availableCategories={data.availableCategories}
		{addToast}
	/>

	<ActivityTagsAccordion
		activityId={data.activity.id}
		bind:tags
		availableTags={data.availableTags}
		{addToast}
	/>
</div>
