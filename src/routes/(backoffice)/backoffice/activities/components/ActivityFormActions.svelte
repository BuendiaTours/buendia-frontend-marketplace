<script lang="ts">
	/**
	 * ActivityFormActions — Action bar for activity form (back, delete, submit).
	 * Submit button is hidden when no formId is provided (e.g. sub-resource tabs).
	 * Delete uses progressive enhancement to avoid full page reload.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import { ACTIVITY_ROUTES } from '$lib/config/routes/backoffice/activities';

	type Props = {
		mode: 'create' | 'edit';
		activityId?: string;
		formId?: string;
		submitting?: boolean;
	};

	let { mode, activityId, formId, submitting = false }: Props = $props();

	const isCreateMode = $derived(mode === 'create');
	const isEditMode = $derived(mode === 'edit');
</script>

<div
	class="bnd-main-actions bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 py-4"
>
	<a href={`${ACTIVITY_ROUTES.list}?${page.url.searchParams.toString()}`} class="btn btn-ghost">
		← {m.activities_backToList()}
	</a>

	{#if isEditMode && activityId}
		<form
			method="POST"
			action={`${ACTIVITY_ROUTES.edit(activityId)}?/delete`}
			class="ml-auto"
			use:enhance
		>
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
