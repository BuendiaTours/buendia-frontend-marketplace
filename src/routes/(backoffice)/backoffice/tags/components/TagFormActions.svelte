<script lang="ts">
	/**
	 * TagFormActions — Action bar for tag form (back, delete, submit).
	 * Delete uses progressive enhancement to avoid full page reload.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import { TAG_ROUTES } from '$lib/config/routes/backoffice/tags';

	type Props = {
		mode: 'create' | 'edit';
		/** Required in edit mode — used to build the delete action URL. */
		tagId?: string;
		/** Binds the submit button to the external form element via the `form` attribute. */
		formId: string;
	};

	let { mode, tagId, formId }: Props = $props();

	const isCreateMode = $derived(mode === 'create');
	const isEditMode = $derived(mode === 'edit');
</script>

<div
	class="bnd-main-actions border-base-content/10 bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 border-t py-4"
>
	<a href={`${TAG_ROUTES.list}?${page.url.searchParams.toString()}`} class="btn btn-ghost">
		← {m.tags_backToList()}
	</a>

	{#if isEditMode && tagId}
		<form method="POST" action={`${TAG_ROUTES.edit(tagId)}?/delete`} class="ml-auto" use:enhance>
			<button
				type="submit"
				class="btn btn-soft btn-error"
				use:confirmAction={{
					title: m.tags_confirmDeleteTitle(),
					message: m.tags_confirmDeleteMessage(),
					confirmText: m.common_delete(),
					cancelText: m.common_cancel(),
					danger: true
				}}
			>
				{m.tags_deleteButton()}
			</button>
		</form>
	{/if}

	<button
		form={formId}
		type="submit"
		class="btn btn-outline btn-primary"
		class:ml-auto={isCreateMode}
	>
		{isCreateMode ? m.tags_createTag() : m.tags_saveChanges()}
	</button>
</div>
