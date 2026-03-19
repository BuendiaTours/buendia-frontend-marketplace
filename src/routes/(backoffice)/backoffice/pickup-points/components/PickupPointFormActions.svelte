<script lang="ts">
	/**
	 * PickupPointFormActions — Action bar for pickup point form (back, delete, submit).
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import { PICKUP_POINT_ROUTES } from '$lib/config/routes/backoffice/pickupPoints';

	type Props = {
		mode: 'create' | 'edit';
		pickupPointId?: string;
		formId: string;
		submitting?: boolean;
	};

	let { mode, pickupPointId, formId, submitting = false }: Props = $props();

	const isCreateMode = $derived(mode === 'create');
	const isEditMode = $derived(mode === 'edit');
</script>

<div
	class="bnd-main-actions border-base-content/10 bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 border-t py-4"
>
	<a href={`${PICKUP_POINT_ROUTES.list}?${page.url.searchParams.toString()}`} class="btn btn-ghost">
		← {m.pickupPoints_backToList()}
	</a>

	{#if isEditMode && pickupPointId}
		<form
			method="POST"
			action={`${PICKUP_POINT_ROUTES.edit(pickupPointId)}?/delete`}
			class="ml-auto"
			use:enhance
		>
			<button
				type="submit"
				class="btn btn-soft btn-error"
				disabled={submitting}
				use:confirmAction={{
					title: m.pickupPoints_confirmDeleteTitle(),
					message: m.pickupPoints_confirmDeleteMessage(),
					confirmText: m.common_delete(),
					cancelText: m.common_cancel(),
					danger: true
				}}
			>
				{m.pickupPoints_deleteButton()}
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
		{#if submitting}
			<span class="loading loading-spinner loading-sm"></span>
		{/if}
		{isCreateMode ? m.pickupPoints_createResource() : m.pickupPoints_saveChanges()}
	</button>
</div>
