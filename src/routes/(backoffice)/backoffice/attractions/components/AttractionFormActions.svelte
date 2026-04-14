<script lang="ts">
	/**
	 * AttractionFormActions — Action bar for attraction form (back, delete, submit).
	 * Delete uses progressive enhancement to avoid full page reload.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import { ATTRACTION_ROUTES } from '$lib/config/routes/backoffice/attractions';

	type Props = {
		mode: 'create' | 'edit';
		/** Required in edit mode — used to build the delete action URL. */
		attractionId?: string;
		/** Binds the submit button to the external form element via the `form` attribute. */
		formId: string;
		submitting?: boolean;
		/** Number of activities assigned to this attraction (edit mode only). */
		activityCount?: number;
	};

	let { mode, attractionId, formId, submitting = false, activityCount = 0 }: Props = $props();

	const isCreateMode = $derived(mode === 'create');
	const isEditMode = $derived(mode === 'edit');
</script>

<div
	class="bnd-main-actions border-base-content/10 bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 border-t py-4"
>
	<a href={`${ATTRACTION_ROUTES.list}?${page.url.searchParams.toString()}`} class="btn btn-ghost">
		← {m.attractions_backToList()}
	</a>

	{#if isEditMode}
		<span class="text-base-content/50 text-sm">
			{activityCount}
			{activityCount === 1
				? m.attractions_activityCountSingular()
				: m.attractions_activityCountPlural()}
		</span>
	{/if}

	{#if isEditMode && attractionId}
		<form
			method="POST"
			action={`${ATTRACTION_ROUTES.edit(attractionId)}?/delete`}
			class="ml-auto"
			use:enhance
		>
			<button
				type="submit"
				class="btn btn-soft btn-error"
				disabled={submitting}
				use:confirmAction={{
					title: m.attractions_confirmDeleteTitle(),
					message: m.attractions_confirmDeleteMessage(),
					confirmText: m.common_delete(),
					cancelText: m.common_cancel(),
					danger: true
				}}
			>
				{m.attractions_deleteButton()}
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
		{isCreateMode ? m.attractions_createAttraction() : m.attractions_saveChanges()}
	</button>
</div>
