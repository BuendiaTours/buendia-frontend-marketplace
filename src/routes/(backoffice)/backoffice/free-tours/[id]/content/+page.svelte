<script lang="ts">
	/**
	 * Content tab — manages content blocks, multimedia, and meeting point
	 * linked to the free tour via client-side API calls.
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { FREE_TOUR_REQUEST } from '$core/free-tours/requests';
	import { FREE_TOUR_ROUTES } from '$lib/config/routes/backoffice/freeTours';
	import FreeTourContentBlocksAccordion from '../../components/FreeTourContentBlocksAccordion.svelte';
	import FreeTourMultimediaAccordion from '../../components/FreeTourMultimediaAccordion.svelte';
	import FreeTourMeetingPointAccordion from '../../components/FreeTourMeetingPointAccordion.svelte';

	let { data }: PageProps = $props();

	let contentBlocks = $derived(data.contentBlocks);
	let images = $derived(data.images);

	const addToast =
		getContext<
			(toast: { data: { title: string; description: string; type: 'success' | 'error' } }) => void
		>('freeTourToast');

	const returnToUrl = $derived(FREE_TOUR_ROUTES.content(data.freeTour.id));

	const createContentBlockHref = $derived(
		`/backoffice/content-blocks/create?returnTo=${encodeURIComponent(returnToUrl)}`
	);

	// ── Auto-add content block ───────────────────────
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
			await FREE_TOUR_REQUEST.update(globalThis.fetch, data.freeTour.id, {
				contentBlockIds: [...contentBlocks.map((b) => b.id), cb.id]
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
				data: { title: '✓', description: m.activities_contentBlocksAdded(), type: 'success' }
			});
		} catch (err) {
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
					data: { title: '✗', description: m.activities_contentBlocksError(), type: 'error' }
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
	<FreeTourContentBlocksAccordion
		freeTourId={data.freeTour.id}
		bind:contentBlocks
		{addToast}
		{createContentBlockHref}
	/>

	<FreeTourMultimediaAccordion
		freeTourId={data.freeTour.id}
		freeTourStatus={data.freeTour.status}
		bind:images
		{addToast}
	/>

	<FreeTourMeetingPointAccordion
		freeTourId={data.freeTour.id}
		meetingPoint={data.freeTour.meetingPoint}
		{addToast}
	/>
</div>
