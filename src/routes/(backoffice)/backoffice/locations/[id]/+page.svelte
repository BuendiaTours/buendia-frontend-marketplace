<script lang="ts">
	import * as m from '$paraglide/messages';
	import type { Location } from '$lib/types';
	import { page } from '$app/state';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import DebugApiJson from '$lib/components/backoffice/debug/DebugApiJson.svelte';
	import { LOCATION_ROUTES } from '$lib/config/routes/backoffice/locations';

	let { data }: { data: { location: Location } } = $props();
	const location = $derived(data.location);
</script>

<svelte:head>
	<title>{m.locations_detailPageTitle()}</title>
</svelte:head>

<div
	class="bnd-main-actions border-base-content/10 bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 border-t py-4"
>
	<a href={`${LOCATION_ROUTES.list}?${page.url.searchParams.toString()}`} class="link">
		← {m.locations_backToList()}
	</a>

	<div class="flex gap-2">
		<a
			href={buildUrlWithFilters(LOCATION_ROUTES.edit(location.id), page.url.searchParams)}
			class="btn btn-outline btn-primary"
		>
			{m.locations_editButton()}
		</a>

		<form
			method="POST"
			action={buildUrlWithFilters(LOCATION_ROUTES.delete(location.id), page.url.searchParams)}
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
	</div>
</div>

<DebugApiJson data={location} />
