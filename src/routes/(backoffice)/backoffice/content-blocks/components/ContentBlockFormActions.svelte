<script lang="ts">
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import { CONTENT_BLOCK_ROUTES } from '$lib/config/routes/backoffice/contentBlocks';

	type Props = {
		mode: 'create' | 'edit';
		contentBlockId?: string;
		formId: string;
		submitting?: boolean;
		/** Number of activities using this content block (edit mode only). */
		activityCount?: number;
	};

	let { mode, contentBlockId, formId, submitting = false, activityCount = 0 }: Props = $props();

	const isCreateMode = $derived(mode === 'create');
	const isEditMode = $derived(mode === 'edit');
</script>

<div
	class="bnd-main-actions border-base-content/10 bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 border-t py-4"
>
	<a
		href={`${CONTENT_BLOCK_ROUTES.list}?${page.url.searchParams.toString()}`}
		class="btn btn-ghost"
	>
		← {m.contentBlocks_backToList()}
	</a>

	{#if isEditMode}
		<span class="text-base-content/50 text-sm">
			{activityCount}
			{activityCount === 1
				? m.contentBlocks_activityCountSingular()
				: m.contentBlocks_activityCountPlural()}
		</span>
	{/if}

	{#if isEditMode && contentBlockId}
		<form
			method="POST"
			action={`${CONTENT_BLOCK_ROUTES.edit(contentBlockId)}?/delete`}
			class="ml-auto"
			use:enhance
		>
			<button
				type="submit"
				class="btn btn-soft btn-error"
				disabled={submitting}
				use:confirmAction={{
					title: m.contentBlocks_confirmDeleteTitle(),
					message: m.contentBlocks_confirmDeleteMessage(),
					confirmText: m.common_delete(),
					cancelText: m.common_cancel(),
					danger: true
				}}
			>
				{m.contentBlocks_deleteButton()}
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
		{isCreateMode ? m.contentBlocks_createResource() : m.contentBlocks_saveChanges()}
	</button>
</div>
