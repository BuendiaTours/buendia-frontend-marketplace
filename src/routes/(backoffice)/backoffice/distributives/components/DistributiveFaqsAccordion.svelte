<script lang="ts">
	/**
	 * DistributiveFaqsAccordion — Manages distributive ↔ FAQ relationships.
	 * Uses FAQ_RELATIONSHIP_REQUEST to create/delete faq relationships
	 * with entityType=DISTRIBUTIVE and entityId=distributiveId.
	 */
	import * as m from '$paraglide/messages';
	import { ChecklistMinimalistic, Close } from '$lib/icons/Linear';
	import { FAQ_RELATIONSHIP_REQUEST } from '$core/faqs/requests';
	import { FaqRelationshipEntityType } from '$core/faqs/enums';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import { showConfirmDialog } from '$lib/actions/backoffice/confirmAction';

	type FaqWithRelation = {
		relationshipId: string;
		faqId: string;
		question: string;
	};

	type ToastFn = (data: {
		data: { title: string; description: string; type: 'success' | 'error' };
	}) => void;

	type Props = {
		distributiveId: string;
		faqs: FaqWithRelation[];
		availableFaqs: { id: string; question: string }[];
		addToast?: ToastFn;
		createFaqHref?: string;
	};

	let {
		distributiveId,
		faqs = $bindable(),
		availableFaqs,
		addToast,
		createFaqHref
	}: Props = $props();

	let selectedFaqId = $state('');
	let isAdding = $state(false);
	let isRemoving = $state<string | null>(null);

	const unassignedFaqs = $derived(
		availableFaqs.filter((f) => !faqs.some((af) => af.faqId === f.id))
	);

	function showToast(type: 'success' | 'error', description: string) {
		addToast?.({ data: { title: type === 'success' ? 'Success' : 'Error', description, type } });
	}

	async function handleAdd() {
		if (!selectedFaqId) return;

		isAdding = true;
		try {
			const relationshipId = crypto.randomUUID();
			await FAQ_RELATIONSHIP_REQUEST.create(fetch, {
				id: relationshipId,
				entityId: distributiveId,
				entityType: FaqRelationshipEntityType.DISTRIBUTIVE,
				faqId: selectedFaqId
			});

			const added = availableFaqs.find((f) => f.id === selectedFaqId);
			if (added) {
				faqs = [...faqs, { relationshipId, faqId: added.id, question: added.question }];
			}

			selectedFaqId = '';
			showToast('success', m.distributives_faqsAdded());
		} catch (err) {
			console.error('Error adding FAQ:', err);
			showToast('error', m.distributives_faqsError());
		} finally {
			isAdding = false;
		}
	}

	async function handleRemove(faq: FaqWithRelation) {
		const confirmed = await showConfirmDialog({
			title: m.distributives_confirmRemoveTitle(),
			message: m.distributives_confirmRemoveMessage(),
			confirmText: m.common_delete(),
			cancelText: m.common_cancel(),
			danger: true
		});
		if (!confirmed) return;

		isRemoving = faq.relationshipId;
		try {
			await FAQ_RELATIONSHIP_REQUEST.delete(fetch, faq.relationshipId);
			faqs = faqs.filter((f) => f.relationshipId !== faq.relationshipId);
			showToast('success', m.distributives_faqsRemoved());
		} catch (err) {
			console.error('Error removing FAQ:', err);
			showToast('error', m.distributives_faqsError());
		} finally {
			isRemoving = null;
		}
	}
</script>

<FormAccordion name="form-distributive-faqs" open>
	{#snippet title()}
		<ChecklistMinimalistic class="size-6" />
		<span>{m.distributives_sectionFaqs()}</span>
	{/snippet}
	{#snippet asideContent()}
		<p class="text-xs">{m.distributives_sectionFaqsDescription()}</p>
	{/snippet}
	{#snippet content()}
		<div class="flex items-end gap-2 md:col-span-12">
			<div class="flex-1">
				<label class="label text-sm" for="faqSelect">
					<span>{m.distributives_labelFaq()}</span>
				</label>
				<select id="faqSelect" class="select w-full" bind:value={selectedFaqId} disabled={isAdding}>
					<option value="" disabled>{m.distributives_placeholderFaq()}</option>
					{#each unassignedFaqs as faq (faq.id)}
						<option value={faq.id}>{faq.question}</option>
					{/each}
				</select>
			</div>

			<button
				type="button"
				class="btn btn-outline btn-primary btn-sm h-[42px]"
				disabled={!selectedFaqId || isAdding}
				onclick={handleAdd}
			>
				{#if isAdding}
					<span class="loading loading-spinner loading-xs"></span>
				{:else}
					{m.distributives_faqsAddButton()}
				{/if}
			</button>

			{#if createFaqHref}
				<a href={createFaqHref} class="btn btn-outline btn-secondary btn-sm h-[42px]">
					{m.faqs_newResource()}
				</a>
			{/if}
		</div>

		<div class="md:col-span-12">
			{#if faqs.length === 0}
				<div class="flex flex-col items-center gap-2 py-8">
					<ChecklistMinimalistic class="text-base-content/20 size-10" />
					<p class="text-base-content/50 text-sm">{m.distributives_faqsEmpty()}</p>
				</div>
			{:else}
				<div class="mt-2 space-y-2">
					{#each faqs as faq (faq.relationshipId)}
						<div
							class="border-neutral bg-base-200/50 flex items-center gap-3 rounded-lg border-l-4 px-3 py-2.5"
						>
							<ChecklistMinimalistic class="text-base-content/40 size-5 shrink-0" />
							<span class="min-w-0 flex-1 font-medium">{faq.question}</span>
							<button
								type="button"
								class="btn btn-ghost btn-xs text-error hover:bg-error/10"
								disabled={isRemoving === faq.relationshipId}
								onclick={() => handleRemove(faq)}
							>
								{#if isRemoving === faq.relationshipId}
									<span class="loading loading-spinner loading-xs"></span>
								{:else}
									<Close class="size-4" />
								{/if}
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/snippet}
</FormAccordion>
