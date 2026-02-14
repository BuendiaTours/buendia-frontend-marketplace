<script lang="ts">
	import type { Destination } from '$lib/types';
	import { page } from '$app/state';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import DebugApiJson from '$lib/components/backoffice/debug/DebugApiJson.svelte';
	import { DESTINATION_ROUTES } from '$api-destinations/routes';

	export let data: { destination: Destination };
	const { destination } = data;
</script>

<div
	class="bnd-main-actions border-base-content/10 bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 border-t py-4"
>
	<a href={`${DESTINATION_ROUTES.list}?${page.url.searchParams.toString()}`} class="link">
		← Volver al listado
	</a>

	<div class="flex gap-2">
		<a
			href={buildUrlWithFilters(DESTINATION_ROUTES.edit(destination.slug), page.url.searchParams)}
			class="btn btn-outline btn-primary"
		>
			Edit
		</a>

		<form
			method="POST"
			action={buildUrlWithFilters(
				DESTINATION_ROUTES.delete(destination.slug),
				page.url.searchParams
			)}
		>
			<button
				type="submit"
				class="btn btn-soft btn-error"
				use:confirmAction={{
					title: 'Eliminar elemento',
					message: '¿Estás seguro de que quieres eliminar este elemento?',
					confirmText: 'Eliminar',
					cancelText: 'Cancelar',
					danger: true
				}}
			>
				Delete
			</button>
		</form>
	</div>
</div>

<DebugApiJson data={destination} />
