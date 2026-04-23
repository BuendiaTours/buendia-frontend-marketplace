<script lang="ts">
	/**
	 * Content tab — manages content blocks, multimedia, and FAQs
	 * linked to the distributive via client-side API calls.
	 * Supports auto-add when returning from content block / FAQ creation.
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { DISTRIBUTIVE_REQUEST } from '$core/distributives/requests';
	import { FAQ_RELATIONSHIP_REQUEST } from '$core/faqs/requests';
	import { FaqRelationshipEntityType } from '$core/faqs/enums';
	import { DISTRIBUTIVE_ROUTES } from '$lib/config/routes/backoffice/distributives';
	import DistributiveContentBlocksAccordion from '../../components/DistributiveContentBlocksAccordion.svelte';
	import DistributiveMultimediaAccordion from '../../components/DistributiveMultimediaAccordion.svelte';
	import DistributiveFaqsAccordion from '../../components/DistributiveFaqsAccordion.svelte';

	let { data }: PageProps = $props();

	let contentBlocks = $derived(data.contentBlocks);
	let images = $derived(data.images);
	let faqs = $derived(data.distributiveFaqs);

	const addToast =
		getContext<
			(toast: { data: { title: string; description: string; type: 'success' | 'error' } }) => void
		>('distributiveToast');

	const returnToUrl = $derived(DISTRIBUTIVE_ROUTES.contentBlocks(data.distributive.id));

	const createContentBlockHref = $derived(
		`/backoffice/content-blocks/create?distributiveId=${data.distributive.id}&returnTo=${encodeURIComponent(returnToUrl)}`
	);

	const createFaqHref = $derived(
		`/backoffice/faqs/create?distributiveId=${data.distributive.id}&returnTo=${encodeURIComponent(returnToUrl)}`
	);

	let isAutoAdding = $state(false);
	let autoAddDone = $state(false);

	async function autoAddPendingContentBlock() {
		if (!data.pendingContentBlock) return;

		const cb = data.pendingContentBlock;

		// If the block was just created with this distributiveId, the backend already
		// links it to this distributive — skip the explicit relationship add so we
		// don't interfere with that link (which would wipe the content-blocks list).
		if (cb.distributiveId === data.distributive.id) {
			goto(returnToUrl, { replaceState: true, noScroll: true });
			return;
		}

		const alreadyAdded = contentBlocks.some((b) => b.id === cb.id);

		if (alreadyAdded) {
			goto(returnToUrl, { replaceState: true, noScroll: true });
			return;
		}

		isAutoAdding = true;
		try {
			await DISTRIBUTIVE_REQUEST.addContentBlock(globalThis.fetch, data.distributive.id, {
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
					description: m.distributives_contentBlocksAdded(),
					type: 'success'
				}
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
					data: {
						title: '✗',
						description: m.distributives_contentBlocksError(),
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

	let isAutoAddingFaq = $state(false);
	let autoAddFaqDone = $state(false);

	async function autoAddPendingFaq() {
		if (!data.pendingFaq) return;

		const faq = data.pendingFaq;
		const alreadyAdded = faqs.some((f) => f.faqId === faq.id);

		if (alreadyAdded) {
			goto(returnToUrl, { replaceState: true, noScroll: true });
			return;
		}

		isAutoAddingFaq = true;
		try {
			const relationshipId = crypto.randomUUID();
			await FAQ_RELATIONSHIP_REQUEST.create(globalThis.fetch, {
				id: relationshipId,
				entityId: data.distributive.id,
				entityType: FaqRelationshipEntityType.DISTRIBUTIVE,
				faqId: faq.id
			});

			faqs = [...faqs, { relationshipId, faqId: faq.id, question: faq.question }];

			addToast({
				data: {
					title: '✓',
					description: m.distributives_faqsAdded(),
					type: 'success'
				}
			});
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && err.status === 409) {
				if (!faqs.some((f) => f.faqId === faq.id)) {
					faqs = [
						...faqs,
						{ relationshipId: crypto.randomUUID(), faqId: faq.id, question: faq.question }
					];
				}
			} else {
				console.error('Error auto-adding FAQ:', err);
				addToast({
					data: {
						title: '✗',
						description: m.distributives_faqsError(),
						type: 'error'
					}
				});
			}
		} finally {
			isAutoAddingFaq = false;
			autoAddFaqDone = true;
			goto(returnToUrl, { replaceState: true, noScroll: true });
		}
	}

	$effect(() => {
		if (data.pendingFaq && !autoAddFaqDone && !isAutoAddingFaq) {
			autoAddPendingFaq();
		}
	});
</script>

<div class="space-y-4">
	<DistributiveContentBlocksAccordion
		distributiveId={data.distributive.id}
		bind:contentBlocks
		{addToast}
		{createContentBlockHref}
	/>

	<DistributiveMultimediaAccordion
		distributiveId={data.distributive.id}
		distributiveStatus={data.distributive.status}
		bind:images
		{addToast}
	/>

	<DistributiveFaqsAccordion
		distributiveId={data.distributive.id}
		bind:faqs
		availableFaqs={data.availableFaqs}
		{addToast}
		{createFaqHref}
	/>
</div>
