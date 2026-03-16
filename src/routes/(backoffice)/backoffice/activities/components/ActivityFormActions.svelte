<script lang="ts">
	/**
	 * ActivityFormActions — Action bar for activity form (back, delete, submit).
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
		formId: string;
	};

	let { mode, activityId, formId }: Props = $props();

	const isCreateMode = $derived(mode === 'create');
	const isEditMode = $derived(mode === 'edit');
</script>

<div
	class="bnd-main-actions border-base-content/10 bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 border-t py-4"
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

	<button
		form={formId}
		type="submit"
		class="btn btn-outline btn-primary"
		class:ml-auto={isCreateMode}
	>
		{isCreateMode ? m.activities_createActivity() : m.activities_saveChanges()}
	</button>
</div>
