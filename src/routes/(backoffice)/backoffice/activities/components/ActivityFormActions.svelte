<script lang="ts">
	/**
	 * ActivityFormActions — Action bar for activity form (back, status, delete, submit).
	 * Shows the current status as a prominent badge with a transition button.
	 * Submit button is hidden when no formId is provided (e.g. sub-resource tabs).
	 * Delete uses progressive enhancement to avoid full page reload.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import { ACTIVITY_ROUTES } from '$lib/config/routes/backoffice/activities';
	import { ActivityStatus } from '$core/activities/enums';
	import { ACTIVITY_STATUS_OPTIONS } from '$lib/labels/activities';

	type Props = {
		mode: 'create' | 'edit';
		activityId?: string;
		activityStatus?: ActivityStatus;
		formId?: string;
		submitting?: boolean;
	};

	let { mode, activityId, activityStatus, formId, submitting = false }: Props = $props();

	const isCreateMode = $derived(mode === 'create');
	const isEditMode = $derived(mode === 'edit');

	const statusLabel = $derived(
		ACTIVITY_STATUS_OPTIONS.find((o) => o.id === activityStatus)?.name ?? activityStatus
	);

	const statusBadgeClass = $derived.by(() => {
		switch (activityStatus) {
			case ActivityStatus.PUBLISHED:
				return 'badge-success';
			case ActivityStatus.DRAFT:
				return 'badge-warning';
			case ActivityStatus.UNPUBLISHED:
				return 'badge-neutral';
			default:
				return 'badge-ghost';
		}
	});

	const canPublish = $derived(
		activityStatus === ActivityStatus.DRAFT || activityStatus === ActivityStatus.UNPUBLISHED
	);
	const canUnpublish = $derived(activityStatus === ActivityStatus.PUBLISHED);
	const nextStatus = $derived(canPublish ? ActivityStatus.PUBLISHED : ActivityStatus.UNPUBLISHED);
</script>

<div
	class="bnd-main-actions bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 py-4"
>
	<a href={`${ACTIVITY_ROUTES.list}?${page.url.searchParams.toString()}`} class="btn btn-ghost">
		← {m.activities_backToList()}
	</a>

	{#if isEditMode && activityStatus}
		<span class="badge badge-lg {statusBadgeClass}">{statusLabel}</span>
	{/if}

	<div class="ml-auto flex items-center gap-2">
		{#if isEditMode && activityId && (canPublish || canUnpublish)}
			<form method="POST" action="?/changeStatus" use:enhance>
				<input type="hidden" name="status" value={nextStatus} />
				{#if canPublish}
					<button
						type="submit"
						class="btn btn-soft btn-success"
						disabled={submitting}
						use:confirmAction={{
							title: m.activities_confirmPublishTitle(),
							message: m.activities_confirmPublishMessage(),
							confirmText: m.activities_publishButton(),
							cancelText: m.common_cancel(),
							danger: false
						}}
					>
						{m.activities_publishButton()}
					</button>
				{:else}
					<button
						type="submit"
						class="btn btn-soft btn-warning"
						disabled={submitting}
						use:confirmAction={{
							title: m.activities_confirmUnpublishTitle(),
							message: m.activities_confirmUnpublishMessage(),
							confirmText: m.activities_unpublishButton(),
							cancelText: m.common_cancel(),
							danger: true
						}}
					>
						{m.activities_unpublishButton()}
					</button>
				{/if}
			</form>
		{/if}

		{#if isEditMode && activityId}
			<form method="POST" action={`${ACTIVITY_ROUTES.edit(activityId)}?/delete`} use:enhance>
				<button
					type="submit"
					class="btn btn-soft btn-error"
					disabled={submitting}
					use:confirmAction={{
						title: m.activities_confirmDeleteTitle(),
						message: m.activities_confirmDeleteMessage(),
						confirmText: m.common_delete(),
						cancelText: m.common_cancel(),
						danger: true
					}}
				>
					{m.activities_deleteButton()}
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
				{isCreateMode ? m.activities_createActivity() : m.activities_saveChanges()}
			</button>
		{/if}
	</div>
</div>
