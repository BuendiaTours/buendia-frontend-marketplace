<script lang="ts">
	/**
	 * Content tab — manages content blocks, multimedia, meals, and addons
	 * linked to the activity via client-side API calls.
	 * Supports auto-add when returning from content block creation.
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import type { ActivityAddon } from '$core/activity-addons/types';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { ACTIVITY_REQUEST } from '$core/activities/requests';
	import { ACTIVITY_ROUTES } from '$lib/config/routes/backoffice/activities';
	import ActivityContentBlocksAccordion from '../../components/ActivityContentBlocksAccordion.svelte';
	import ActivityMultimediaAccordion from '../../components/ActivityMultimediaAccordion.svelte';
	import ActivityMealsAccordion from '../../components/ActivityMealsAccordion.svelte';
	import ActivityAddonsAccordion from '../../components/ActivityAddonsAccordion.svelte';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	let contentBlocks = $state(data.contentBlocks);
	// svelte-ignore state_referenced_locally
	let images = $state(data.images);
	// svelte-ignore state_referenced_locally
	let meals = $state(data.meals);
	// svelte-ignore state_referenced_locally
	let addons: ActivityAddon[] = $state(data.addons);

	const addToast =
		getContext<
			(toast: { data: { title: string; description: string; type: 'success' | 'error' } }) => void
		>('activityToast');

	const returnToUrl = $derived(ACTIVITY_ROUTES.contentBlocks(data.activity.id));

	const createContentBlockHref = $derived(
		`/backoffice/content-blocks/create?returnTo=${encodeURIComponent(returnToUrl)}`
	);

	/** Auto-add content block when returning from creation page. */
	let isAutoAdding = $state(false);
	let autoAddDone = $state(false);

	async function autoAddPendingContentBlock() {
		if (!data.pendingContentBlock) return;

		const cb = data.pendingContentBlock;
		const alreadyAdded = contentBlocks.some((b) => b.id === cb.id);

		if (alreadyAdded) {
			goto(returnToUrl, { replaceState: true, noScroll: true });
			return;
		}

		isAutoAdding = true;
		try {
			await ACTIVITY_REQUEST.addContentBlock(globalThis.fetch, data.activity.id, {
				contentBlockId: cb.id
			});

			contentBlocks = [
				...contentBlocks,
				{
					id: cb.id,
					title: cb.title,
					description: cb.description,
					kind: cb.kind,
					target: cb.target
				}
			];

			addToast({
				data: {
					title: '✓',
					description: m.activities_contentBlocksAdded(),
					type: 'success'
				}
			});
		} catch (err) {
			// 409 = already added (race condition with CQRS) — treat as success
			if (err && typeof err === 'object' && 'status' in err && err.status === 409) {
				if (!contentBlocks.some((b) => b.id === cb.id)) {
					contentBlocks = [
						...contentBlocks,
						{
							id: cb.id,
							title: cb.title,
							description: cb.description,
							kind: cb.kind,
							target: cb.target
						}
					];
				}
			} else {
				console.error('Error auto-adding content block:', err);
				addToast({
					data: {
						title: '✗',
						description: m.activities_contentBlocksError(),
						type: 'error'
					}
				});
			}
		} finally {
			isAutoAdding = false;
			autoAddDone = true;
			goto(returnToUrl, { replaceState: true, noScroll: true });
		}
	}

	$effect(() => {
		if (data.pendingContentBlock && !autoAddDone && !isAutoAdding) {
			autoAddPendingContentBlock();
		}
	});
</script>

<div class="space-y-4">
	<ActivityContentBlocksAccordion
		activityId={data.activity.id}
		bind:contentBlocks
		{addToast}
		{createContentBlockHref}
	/>

	<ActivityMultimediaAccordion activityId={data.activity.id} bind:images {addToast} />

	<ActivityMealsAccordion activityId={data.activity.id} bind:meals {addToast} />

	<ActivityAddonsAccordion activityId={data.activity.id} bind:addons {addToast} />
</div>
