<script lang="ts">
	/**
	 * FreeTourFormActions — Action bar for free tour form (back, status, delete, submit).
	 * Shows the current status as a prominent badge with a publish/unpublish transition button.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import { FREE_TOUR_ROUTES } from '$lib/config/routes/backoffice/freeTours';
	import { FreeTourStatus } from '$core/free-tours/enums';
	import type {
		FreeTourPublishPrecondition,
		FreeTourPublishReadiness
	} from '$core/free-tours/types';
	import { FREE_TOUR_STATUS_OPTIONS } from '$lib/labels/freeTours';

	type Props = {
		mode: 'create' | 'edit';
		freeTourId?: string;
		freeTourStatus?: FreeTourStatus;
		publishReadiness?: FreeTourPublishReadiness;
		formId: string;
		submitting?: boolean;
	};

	let {
		mode,
		freeTourId,
		freeTourStatus,
		publishReadiness,
		formId,
		submitting = false
	}: Props = $props();

	const preconditionLabels: Record<FreeTourPublishPrecondition, () => string> = {
		destinations: m.freeTours_publishPreconditionDestinations,
		categories: m.freeTours_publishPreconditionCategories,
		media: m.freeTours_publishPreconditionMedia,
		entries: m.freeTours_publishPreconditionEntries,
		groupedActivity: m.freeTours_publishPreconditionGroupedActivity
	};

	const missingLabels = $derived(
		(publishReadiness?.missing ?? []).map((key) => preconditionLabels[key]?.() ?? key)
	);

	const publishBlocked = $derived(publishReadiness ? !publishReadiness.ready : false);
	const publishBlockedReason = $derived(
		publishBlocked && missingLabels.length > 0
			? m.freeTours_publishBlockedTooltip({ missing: missingLabels.join(', ') })
			: ''
	);

	const isCreateMode = $derived(mode === 'create');
	const isEditMode = $derived(mode === 'edit');

	const statusLabel = $derived(
		FREE_TOUR_STATUS_OPTIONS.find((o) => o.id === freeTourStatus)?.name ?? freeTourStatus
	);

	const statusBadgeClass = $derived.by(() => {
		switch (freeTourStatus) {
			case FreeTourStatus.PUBLISHED:
				return 'badge-success';
			case FreeTourStatus.DRAFT:
				return 'badge-warning';
			case FreeTourStatus.UNPUBLISHED:
				return 'badge-neutral';
			default:
				return 'badge-ghost';
		}
	});

	const canPublish = $derived(
		freeTourStatus === FreeTourStatus.DRAFT || freeTourStatus === FreeTourStatus.UNPUBLISHED
	);
	const canUnpublish = $derived(freeTourStatus === FreeTourStatus.PUBLISHED);
</script>

<div
	class="bnd-main-actions bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 py-4"
>
	<a href={`${FREE_TOUR_ROUTES.list}?${page.url.searchParams.toString()}`} class="btn btn-ghost">
		← {m.freeTours_backToList()}
	</a>

	{#if isEditMode && freeTourStatus}
		<span class="badge badge-lg {statusBadgeClass}">{statusLabel}</span>
	{/if}

	<div class="ml-auto flex items-center gap-2">
		{#if isEditMode && freeTourId && (canPublish || canUnpublish)}
			<form method="POST" action={`${FREE_TOUR_ROUTES.edit(freeTourId)}?/changeStatus`} use:enhance>
				{#if canPublish}
					<input type="hidden" name="action" value="publish" />
					<div
						class={publishBlocked ? 'tooltip tooltip-bottom' : ''}
						data-tip={publishBlockedReason}
					>
						<button
							type="submit"
							class="btn btn-soft btn-success"
							disabled={submitting || publishBlocked}
							use:confirmAction={{
								title: m.freeTours_confirmPublishTitle(),
								message: m.freeTours_confirmPublishMessage(),
								confirmText: m.freeTours_publishButton(),
								cancelText: m.common_cancel(),
								danger: false
							}}
						>
							{m.freeTours_publishButton()}
						</button>
					</div>
				{:else}
					<input type="hidden" name="action" value="unpublish" />
					<button
						type="submit"
						class="btn btn-soft btn-warning"
						disabled={submitting}
						use:confirmAction={{
							title: m.freeTours_confirmUnpublishTitle(),
							message: m.freeTours_confirmUnpublishMessage(),
							confirmText: m.freeTours_unpublishButton(),
							cancelText: m.common_cancel(),
							danger: true
						}}
					>
						{m.freeTours_unpublishButton()}
					</button>
				{/if}
			</form>
		{/if}

		{#if isEditMode && freeTourId}
			<form method="POST" action={`${FREE_TOUR_ROUTES.edit(freeTourId)}?/delete`} use:enhance>
				<button
					type="submit"
					class="btn btn-soft btn-error"
					disabled={submitting}
					use:confirmAction={{
						title: m.freeTours_confirmDeleteTitle(),
						message: m.freeTours_confirmDeleteMessage(),
						confirmText: m.common_delete(),
						cancelText: m.common_cancel(),
						danger: true
					}}
				>
					{m.freeTours_deleteButton()}
				</button>
			</form>
		{/if}

		<button
			form={formId}
			type="submit"
			class="btn btn-outline btn-primary"
			class:ml-auto={isCreateMode}
			disabled={submitting}
		>
			{#if submitting}<span class="loading loading-spinner loading-sm"></span>{/if}
			{isCreateMode ? m.freeTours_createResource() : m.freeTours_saveChanges()}
		</button>
	</div>
</div>
