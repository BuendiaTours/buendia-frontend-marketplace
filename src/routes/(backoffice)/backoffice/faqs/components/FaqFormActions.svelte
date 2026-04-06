<script lang="ts">
	/**
	 * FaqFormActions — Action bar for FAQ form (back, status, delete, submit).
	 * Shows the current status as a prominent badge with publish/unpublish transition buttons.
	 * Delete uses progressive enhancement to avoid full page reload.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import { FAQ_ROUTES } from '$lib/config/routes/backoffice/faqs';
	import { FaqStatus } from '$core/faqs/enums';
	import { FAQ_STATUS_OPTIONS } from '$lib/labels/faqs';

	type Props = {
		mode: 'create' | 'edit';
		faqId?: string;
		faqStatus?: FaqStatus;
		formId: string;
		submitting?: boolean;
	};

	let { mode, faqId, faqStatus, formId, submitting = false }: Props = $props();

	const isCreateMode = $derived(mode === 'create');
	const isEditMode = $derived(mode === 'edit');

	const statusLabel = $derived(
		FAQ_STATUS_OPTIONS.find((o) => o.id === faqStatus)?.name ?? faqStatus
	);

	const statusBadgeClass = $derived.by(() => {
		switch (faqStatus) {
			case FaqStatus.PUBLISHED:
				return 'badge-success';
			case FaqStatus.DRAFT:
				return 'badge-warning';
			default:
				return 'badge-ghost';
		}
	});

	const canPublish = $derived(faqStatus === FaqStatus.DRAFT);
	const canUnpublish = $derived(faqStatus === FaqStatus.PUBLISHED);
	const nextStatus = $derived(canPublish ? FaqStatus.PUBLISHED : FaqStatus.DRAFT);
</script>

<div
	class="bnd-main-actions bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 py-4"
>
	<a href={`${FAQ_ROUTES.list}?${page.url.searchParams.toString()}`} class="btn btn-ghost">
		← {m.faqs_backToList()}
	</a>

	{#if isEditMode && faqStatus}
		<span class="badge badge-lg {statusBadgeClass}">{statusLabel}</span>
	{/if}

	<div class="ml-auto flex items-center gap-2">
		{#if isEditMode && faqId && (canPublish || canUnpublish)}
			<form method="POST" action="?/changeStatus" use:enhance>
				<input type="hidden" name="status" value={nextStatus} />
				{#if canPublish}
					<button
						type="submit"
						class="btn btn-soft btn-success"
						disabled={submitting}
						use:confirmAction={{
							title: m.faqs_confirmPublishTitle(),
							message: m.faqs_confirmPublishMessage(),
							confirmText: m.faqs_publishButton(),
							cancelText: m.common_cancel(),
							danger: false
						}}
					>
						{m.faqs_publishButton()}
					</button>
				{:else}
					<button
						type="submit"
						class="btn btn-soft btn-warning"
						disabled={submitting}
						use:confirmAction={{
							title: m.faqs_confirmUnpublishTitle(),
							message: m.faqs_confirmUnpublishMessage(),
							confirmText: m.faqs_unpublishButton(),
							cancelText: m.common_cancel(),
							danger: true
						}}
					>
						{m.faqs_unpublishButton()}
					</button>
				{/if}
			</form>
		{/if}

		{#if isEditMode && faqId}
			<form method="POST" action={`${FAQ_ROUTES.edit(faqId)}?/delete`} use:enhance>
				<button
					type="submit"
					class="btn btn-soft btn-error"
					disabled={submitting}
					use:confirmAction={{
						title: m.faqs_confirmDeleteTitle(),
						message: m.faqs_confirmDeleteMessage(),
						confirmText: m.common_delete(),
						cancelText: m.common_cancel(),
						danger: true
					}}
				>
					{m.faqs_deleteButton()}
				</button>
			</form>
		{/if}

		{#if formId}
			<button
				form={formId}
				type="submit"
				class="btn btn-outline btn-primary"
				class:ml-auto={isCreateMode}
				disabled={submitting}
			>
				{#if submitting}
					<span class="loading loading-spinner loading-sm"></span>
				{/if}
				{isCreateMode ? m.faqs_createResource() : m.faqs_saveChanges()}
			</button>
		{/if}
	</div>
</div>
