<script lang="ts">
	import type { Destination } from '$lib/types';
	import { page } from '$app/stores';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction } from '$lib/actions/confirmAction';
	import DebugApiJson from '$lib/components/debug/DebugApiJson.svelte';

	export let data: { destination: Destination };
	const { destination } = data;
</script>

<div class="mb-4 flex items-center justify-between">
	<a href={`/destinations?${$page.url.searchParams.toString()}`} class="link">
		← Volver al listado
	</a>

	<div class="flex gap-2">
		<a
			href={buildUrlWithFilters(`/destinations/${destination.slug}/edit`, $page.url.searchParams)}
			class="btn btn-outline btn-primary"
		>
			Edit
		</a>

		<form
			method="POST"
			action={buildUrlWithFilters(
				`/destinations/${destination.slug}/delete`,
				$page.url.searchParams
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
