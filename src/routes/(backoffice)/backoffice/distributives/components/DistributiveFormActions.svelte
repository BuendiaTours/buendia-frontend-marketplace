<script lang="ts">
	/**
	 * DistributiveFormActions — Action bar for distributive form (back, status, delete, submit).
	 * Shows the current status as a prominent badge with a publish/unpublish transition button.
	 * Delete uses progressive enhancement to avoid full page reload.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import { DISTRIBUTIVE_ROUTES } from '$lib/config/routes/backoffice/distributives';
	import { DistributiveStatus } from '$core/distributives/enums';
	import { DISTRIBUTIVE_STATUS_OPTIONS } from '$lib/labels/distributives';

	type Props = {
		mode: 'create' | 'edit';
		/** Required in edit mode — used to build the delete action URL. */
		distributiveId?: string;
		distributiveStatus?: DistributiveStatus;
		/** Binds the submit button to the external form element via the `form` attribute. */
		formId: string;
		submitting?: boolean;
		/** Total number of matching activities (edit mode only). */
		totalActivities?: number;
	};

	let {
		mode,
		distributiveId,
		distributiveStatus,
		formId,
		submitting = false,
		totalActivities = 0
	}: Props = $props();

	const isCreateMode = $derived(mode === 'create');
	const isEditMode = $derived(mode === 'edit');

	const statusLabel = $derived(
		DISTRIBUTIVE_STATUS_OPTIONS.find((o) => o.id === distributiveStatus)?.name ?? distributiveStatus
	);

	const statusBadgeClass = $derived(
		distributiveStatus === DistributiveStatus.PUBLISHED ? 'badge-success' : 'badge-warning'
	);

	const canPublish = $derived(distributiveStatus === DistributiveStatus.DRAFT);
	const canUnpublish = $derived(distributiveStatus === DistributiveStatus.PUBLISHED);
</script>

<div
	class="bnd-main-actions bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 py-4"
>
	<a href={`${DISTRIBUTIVE_ROUTES.list}?${page.url.searchParams.toString()}`} class="btn btn-ghost">
		← {m.distributives_backToList()}
	</a>

	{#if isEditMode && distributiveStatus}
		<span class="badge badge-lg {statusBadgeClass}">{statusLabel}</span>
	{/if}

	{#if isEditMode}
		<span class="text-base-content/50 text-sm">
			{totalActivities}
			{totalActivities === 1
				? m.distributives_totalActivitiesSingular()
				: m.distributives_totalActivitiesPlural()}
		</span>
	{/if}

	<div class="ml-auto flex items-center gap-2">
		{#if isEditMode && distributiveId && (canPublish || canUnpublish)}
			<form method="POST" action="?/changeStatus" use:enhance>
				{#if canPublish}
					<input type="hidden" name="action" value="publish" />
					<button
						type="submit"
						class="btn btn-soft btn-success"
						disabled={submitting}
						use:confirmAction={{
							title: m.distributives_confirmPublishTitle(),
							message: m.distributives_confirmPublishMessage(),
							confirmText: m.distributives_publishButton(),
							cancelText: m.common_cancel(),
							danger: false
						}}
					>
						{m.distributives_publishButton()}
					</button>
				{:else}
					<input type="hidden" name="action" value="unpublish" />
					<button
						type="submit"
						class="btn btn-soft btn-warning"
						disabled={submitting}
						use:confirmAction={{
							title: m.distributives_confirmUnpublishTitle(),
							message: m.distributives_confirmUnpublishMessage(),
							confirmText: m.distributives_unpublishButton(),
							cancelText: m.common_cancel(),
							danger: true
						}}
					>
						{m.distributives_unpublishButton()}
					</button>
				{/if}
			</form>
		{/if}

		{#if isEditMode && distributiveId}
			<form
				method="POST"
				action={`${DISTRIBUTIVE_ROUTES.edit(distributiveId)}?/delete`}
				use:enhance
			>
				<button
					type="submit"
					class="btn btn-soft btn-error"
					disabled={submitting}
					use:confirmAction={{
						title: m.distributives_confirmDeleteTitle(),
						message: m.distributives_confirmDeleteMessage(),
						confirmText: m.common_delete(),
						cancelText: m.common_cancel(),
						danger: true
					}}
				>
					{m.distributives_deleteButton()}
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
			{isCreateMode ? m.distributives_createResource() : m.distributives_saveChanges()}
		</button>
	</div>
</div>
