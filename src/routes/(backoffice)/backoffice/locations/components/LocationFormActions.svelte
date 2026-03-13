<script lang="ts">
	/**
	 * LocationFormActions - Action bar for location form (back, delete, submit)
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import { LOCATION_ROUTES } from '$lib/config/routes/backoffice/locations';

	type Props = {
		mode: 'create' | 'edit';
		locationId?: string;
		formId: string;
	};

	let { mode, locationId, formId }: Props = $props();

	const isCreateMode = $derived(mode === 'create');
	const isEditMode = $derived(mode === 'edit');
</script>

<div
	class="bnd-main-actions border-base-content/10 bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 border-t py-4"
>
	<a href={`${LOCATION_ROUTES.list}?${page.url.searchParams.toString()}`} class="btn btn-ghost">
		← {m.locations_backToList()}
	</a>

	{#if isEditMode && locationId}
		<form
			method="POST"
			action={buildUrlWithFilters(LOCATION_ROUTES.delete(locationId), page.url.searchParams)}
			class="ml-auto"
		>
			<button
				type="submit"
				class="btn btn-soft btn-error"
				use:confirmAction={{
					title: m.locations_confirmDeleteTitle(),
					message: m.locations_confirmDeleteMessage(),
					confirmText: m.common_delete(),
					cancelText: m.common_cancel(),
					danger: true
				}}
			>
				{m.locations_deleteButton()}
			</button>
		</form>
	{/if}

	<button
		form={formId}
		type="submit"
		class="btn btn-outline btn-primary"
		class:ml-auto={isCreateMode}
	>
		{isCreateMode ? m.locations_createLocation() : m.locations_saveChanges()}
	</button>
</div>
