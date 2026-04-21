<script lang="ts">
	/**
	 * Content tab — manages content blocks and multimedia
	 * linked to the activity via client-side API calls.
	 * Supports auto-add when returning from content block creation.
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { ACTIVITY_REQUEST } from '$core/activities/requests';
	import { FAQ_RELATIONSHIP_REQUEST } from '$core/faqs/requests';
	import { FaqRelationshipEntityType } from '$core/faqs/enums';
	import { ACTIVITY_ROUTES } from '$lib/config/routes/backoffice/activities';
	import ActivityContentBlocksAccordion from '../../components/ActivityContentBlocksAccordion.svelte';
	import ActivityMultimediaAccordion from '../../components/ActivityMultimediaAccordion.svelte';
	import ActivityFaqsAccordion from '../../components/ActivityFaqsAccordion.svelte';

	let { data }: PageProps = $props();

	let contentBlocks = $derived(data.contentBlocks);
	let images = $derived(data.images);
	let faqs = $derived(data.activityFaqs);

	const addToast =
		getContext<
			(toast: { data: { title: string; description: string; type: 'success' | 'error' } }) => void
		>('activityToast');

	const returnToUrl = $derived(ACTIVITY_ROUTES.contentBlocks(data.activity.id));

	const createContentBlockHref = $derived(
		`/backoffice/content-blocks/create?activityId=${data.activity.id}&returnTo=${encodeURIComponent(returnToUrl)}`
	);

	const createFaqHref = $derived(
		`/backoffice/faqs/create?activityId=${data.activity.id}&returnTo=${encodeURIComponent(returnToUrl)}`
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

	// ── Auto-add FAQ ─────────────────────────────────
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
				entityId: data.activity.id,
				entityType: FaqRelationshipEntityType.ACTIVITY,
				faqId: faq.id
			});

			faqs = [...faqs, { relationshipId, faqId: faq.id, question: faq.question }];

			addToast({
				data: {
					title: '✓',
					description: m.activities_faqsAdded(),
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
						description: m.activities_faqsError(),
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
	<ActivityContentBlocksAccordion
		activityId={data.activity.id}
		bind:contentBlocks
		{addToast}
		{createContentBlockHref}
	/>

	<ActivityMultimediaAccordion
		activityId={data.activity.id}
		activityStatus={data.activity.status}
		bind:images
		{addToast}
	/>

	<ActivityFaqsAccordion
		activityId={data.activity.id}
		bind:faqs
		availableFaqs={data.availableFaqs}
		{addToast}
		{createFaqHref}
	/>
</div>
