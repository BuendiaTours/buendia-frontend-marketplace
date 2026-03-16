<script lang="ts">
	/**
	 * SupplierFormActions — Action bar for supplier form (back, delete, submit).
	 * Delete uses progressive enhancement to avoid full page reload.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import { SUPPLIER_ROUTES } from '$lib/config/routes/backoffice/suppliers';

	type Props = {
		mode: 'create' | 'edit';
		/** Required in edit mode — used to build the delete action URL. */
		supplierId?: string;
		/** Binds the submit button to the external form element via the `form` attribute. */
		formId: string;
		submitting?: boolean;
	};

	let { mode, supplierId, formId, submitting = false }: Props = $props();

	const isCreateMode = $derived(mode === 'create');
	const isEditMode = $derived(mode === 'edit');
</script>

<div
	class="bnd-main-actions border-base-content/10 bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 border-t py-4"
>
	<a href={`${SUPPLIER_ROUTES.list}?${page.url.searchParams.toString()}`} class="btn btn-ghost">
		← {m.suppliers_backToList()}
	</a>

	{#if isEditMode && supplierId}
		<form
			method="POST"
			action={`${SUPPLIER_ROUTES.edit(supplierId)}?/delete`}
			class="ml-auto"
			use:enhance
		>
			<button
				type="submit"
				class="btn btn-soft btn-error"
				disabled={submitting}
				use:confirmAction={{
					title: m.suppliers_confirmDeleteTitle(),
					message: m.suppliers_confirmDeleteMessage(),
					confirmText: m.common_delete(),
					cancelText: m.common_cancel(),
					danger: true
				}}
			>
				{m.suppliers_deleteButton()}
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
		{isCreateMode ? m.suppliers_createSupplier() : m.suppliers_saveChanges()}
	</button>
</div>
