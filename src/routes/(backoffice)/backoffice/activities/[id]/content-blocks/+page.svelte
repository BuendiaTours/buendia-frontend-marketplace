<script lang="ts">
	/**
	 * Content blocks tab — manages content blocks linked to the activity.
	 * Order matters: determines display order in the marketplace.
	 * Supports auto-add when returning from content block creation.
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { ACTIVITY_REQUEST } from '$core/activities/requests';
	import { ACTIVITY_ROUTES } from '$lib/config/routes/backoffice/activities';
	import ActivityContentBlocksAccordion from '../../components/ActivityContentBlocksAccordion.svelte';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	let contentBlocks = $state(data.contentBlocks);

	const addToast =
		getContext<
			(toast: { data: { title: string; description: string; type: 'success' | 'error' } }) => void
		>('activityToast');

	const updateContentBlockCount = getContext<(count: number) => void>('updateContentBlockCount');

	$effect(() => {
		updateContentBlockCount(contentBlocks.length);
	});

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
			// Already in projection (CQRS propagated fast) — just clean URL
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

<ActivityContentBlocksAccordion
	activityId={data.activity.id}
	bind:contentBlocks
	{addToast}
	{createContentBlockHref}
/>
