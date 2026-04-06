<script lang="ts">
	/**
	 * SupplierFormActions — Action bar for supplier form (back, status, delete, submit).
	 * Shows the current status as a prominent badge with publish/unpublish transition buttons.
	 * Delete uses progressive enhancement to avoid full page reload.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import { SUPPLIER_ROUTES } from '$lib/config/routes/backoffice/suppliers';
	import { SupplierStatus } from '$core/suppliers/enums';
	import { SUPPLIER_STATUS_OPTIONS } from '$lib/labels/suppliers';

	type Props = {
		mode: 'create' | 'edit';
		supplierId?: string;
		supplierStatus?: SupplierStatus;
		formId: string;
		submitting?: boolean;
	};

	let { mode, supplierId, supplierStatus, formId, submitting = false }: Props = $props();

	const isCreateMode = $derived(mode === 'create');
	const isEditMode = $derived(mode === 'edit');

	const statusLabel = $derived(
		SUPPLIER_STATUS_OPTIONS.find((o) => o.id === supplierStatus)?.name ?? supplierStatus
	);

	const statusBadgeClass = $derived.by(() => {
		switch (supplierStatus) {
			case SupplierStatus.ACTIVE:
				return 'badge-success';
			case SupplierStatus.DRAFT:
				return 'badge-warning';
			case SupplierStatus.INACTIVE:
				return 'badge-neutral';
			default:
				return 'badge-ghost';
		}
	});

	const canPublish = $derived(
		supplierStatus === SupplierStatus.DRAFT || supplierStatus === SupplierStatus.INACTIVE
	);
	const canUnpublish = $derived(supplierStatus === SupplierStatus.ACTIVE);
	const nextStatus = $derived(canPublish ? SupplierStatus.ACTIVE : SupplierStatus.INACTIVE);
</script>

<div
	class="bnd-main-actions bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 py-4"
>
	<a href={`${SUPPLIER_ROUTES.list}?${page.url.searchParams.toString()}`} class="btn btn-ghost">
		← {m.suppliers_backToList()}
	</a>

	{#if isEditMode && supplierStatus}
		<span class="badge badge-lg {statusBadgeClass}">{statusLabel}</span>
	{/if}

	<div class="ml-auto flex items-center gap-2">
		{#if isEditMode && supplierId && (canPublish || canUnpublish)}
			<form method="POST" action="?/changeStatus" use:enhance>
				<input type="hidden" name="status" value={nextStatus} />
				{#if canPublish}
					<button
						type="submit"
						class="btn btn-soft btn-success"
						disabled={submitting}
						use:confirmAction={{
							title: m.suppliers_confirmPublishTitle(),
							message: m.suppliers_confirmPublishMessage(),
							confirmText: m.suppliers_publishButton(),
							cancelText: m.common_cancel(),
							danger: false
						}}
					>
						{m.suppliers_publishButton()}
					</button>
				{:else}
					<button
						type="submit"
						class="btn btn-soft btn-warning"
						disabled={submitting}
						use:confirmAction={{
							title: m.suppliers_confirmUnpublishTitle(),
							message: m.suppliers_confirmUnpublishMessage(),
							confirmText: m.suppliers_unpublishButton(),
							cancelText: m.common_cancel(),
							danger: true
						}}
					>
						{m.suppliers_unpublishButton()}
					</button>
				{/if}
			</form>
		{/if}

		{#if isEditMode && supplierId}
			<form method="POST" action={`${SUPPLIER_ROUTES.edit(supplierId)}?/delete`} use:enhance>
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
				{isCreateMode ? m.suppliers_createSupplier() : m.suppliers_saveChanges()}
			</button>
		{/if}
	</div>
</div>
