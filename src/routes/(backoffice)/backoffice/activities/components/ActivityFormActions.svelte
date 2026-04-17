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
	import { ActivityKind, ActivityStatus } from '$core/activities/enums';
	import { ACTIVITY_STATUS_OPTIONS } from '$lib/labels/activities';
	import ActivityJoinFreeTourDialog from './ActivityJoinFreeTourDialog.svelte';

	type Props = {
		mode: 'create' | 'edit';
		activityId?: string;
		activityKind?: ActivityKind;
		activityStatus?: ActivityStatus;
		formId?: string;
		submitting?: boolean;
		/** Override "back to list" target URL. Defaults to the activities list. */
		listRoute?: string;
		/** Override "back to list" button label. Defaults to "Volver al listado" (activities). */
		backLabel?: string;
		/** Override submit button label in create mode. Defaults to "Crear actividad". */
		createLabel?: string;
	};

	let {
		mode,
		activityId,
		activityKind,
		activityStatus,
		formId,
		submitting = false,
		listRoute,
		backLabel,
		createLabel
	}: Props = $props();

	const resolvedListRoute = $derived(listRoute ?? ACTIVITY_ROUTES.list);
	const resolvedBackLabel = $derived(backLabel ?? m.activities_backToList());
	const resolvedCreateLabel = $derived(createLabel ?? m.activities_createActivity());

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

	const isFreeTourKind = $derived(activityKind === ActivityKind.FREE_TOUR);

	// Publish/unpublish only apply to non-FREE_TOUR activities. FREE_TOUR activities
	// are materialized into an aggregation (via "Crear agrupación") and the
	// aggregation owns its own publication lifecycle.
	const canPublish = $derived(
		!isFreeTourKind &&
			(activityStatus === ActivityStatus.DRAFT ||
				activityStatus === ActivityStatus.UNPUBLISHED ||
				activityStatus === ActivityStatus.APPROVED)
	);
	const canUnpublish = $derived(!isFreeTourKind && activityStatus === ActivityStatus.PUBLISHED);

	// DRAFT FREE_TOUR → user can mark it as ready (DRAFT → PENDING_GROUP).
	const canMarkAsReady = $derived(isFreeTourKind && activityStatus === ActivityStatus.DRAFT);
	// PENDING_GROUP FREE_TOUR → user can either wrap in a new free tour or join an existing one.
	const canCreateGrouping = $derived(
		isFreeTourKind && activityStatus === ActivityStatus.PENDING_GROUP
	);
	const canJoinFreeTour = $derived(
		isFreeTourKind && activityStatus === ActivityStatus.PENDING_GROUP
	);
</script>

<div
	class="bnd-main-actions bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 py-4"
>
	<!--
		data-sveltekit-reload: fuerza navegación nativa para cruzar entre los dominios
		activities ↔ free-tours sin que el cliente reuse proyecciones potencialmente
		incompletas y deje la página en blanco por hidratación fallida.
	-->
	<a
		href={`${resolvedListRoute}?${page.url.searchParams.toString()}`}
		class="btn btn-ghost"
		data-sveltekit-reload
	>
		← {resolvedBackLabel}
	</a>

	{#if isEditMode && activityStatus}
		<span class="badge badge-lg {statusBadgeClass}">{statusLabel}</span>
	{/if}

	<div class="ml-auto flex items-center gap-2">
		{#if isEditMode && activityId && (canPublish || canUnpublish)}
			<form method="POST" action="?/changeStatus" use:enhance>
				{#if canPublish}
					<input type="hidden" name="action" value="publish" />
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
					<input type="hidden" name="action" value="unpublish" />
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

		{#if isEditMode && activityId && canMarkAsReady}
			<form method="POST" action={`${ACTIVITY_ROUTES.edit(activityId)}?/markAsReady`} use:enhance>
				<button
					type="submit"
					class="btn btn-soft btn-success"
					disabled={submitting}
					use:confirmAction={{
						title: m.activities_confirmMarkAsReadyTitle(),
						message: m.activities_confirmMarkAsReadyMessage(),
						confirmText: m.activities_markAsReadyButton(),
						cancelText: m.common_cancel(),
						danger: false
					}}
				>
					{m.activities_markAsReadyButton()}
				</button>
			</form>
		{/if}

		{#if isEditMode && activityId && canCreateGrouping}
			<!--
				No `use:enhance` on purpose: a client-side goto after the action-returned 303
				fetches the aggregation data before the backend projection has finished
				copying from the activity, which causes a blank hydration on the target page.
				Native form submission does a full browser navigation → full SSR on the edit
				page (same as a manual F5) and renders reliably.
			-->
			<form method="POST" action={`${ACTIVITY_ROUTES.edit(activityId)}?/createGrouping`}>
				<button
					type="submit"
					class="btn btn-soft btn-info"
					disabled={submitting}
					use:confirmAction={{
						title: m.activities_confirmCreateGroupingTitle(),
						message: m.activities_confirmCreateGroupingMessage(),
						confirmText: m.activities_createGroupingButton(),
						cancelText: m.common_cancel(),
						danger: false
					}}
				>
					{m.activities_createGroupingButton()}
				</button>
			</form>
		{/if}

		{#if isEditMode && activityId && canJoinFreeTour}
			<ActivityJoinFreeTourDialog {activityId} disabled={submitting} />
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
				{isCreateMode ? resolvedCreateLabel : m.activities_saveChanges()}
			</button>
		{/if}
	</div>
</div>
