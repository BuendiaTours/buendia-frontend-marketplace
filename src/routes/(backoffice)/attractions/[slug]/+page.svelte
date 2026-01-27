<script lang="ts">
	import type { Attraction } from '$lib/types';
	import { page } from '$app/stores';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction } from '$lib/actions/confirmAction';

	export let data: { attraction: Attraction };
	const { attraction } = data;
</script>

<div class="mb-4 flex items-center justify-between">
	<a href={`/attractions?${$page.url.searchParams.toString()}`} class="link">
		← Volver al listado
	</a>

	<div class="flex gap-2">
		<a
			href={buildUrlWithFilters(`/attractions/${attraction.slug}/edit`, $page.url.searchParams)}
			class="btn btn-outline btn-primary"
		>
			Edit
		</a>

		<form
			method="POST"
			action={buildUrlWithFilters(`/attractions/${attraction.slug}/delete`, $page.url.searchParams)}
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

<pre class="overflow-x-auto rounded-box bg-base-200 p-4 text-xs">{JSON.stringify(
		attraction,
		null,
		2
	)}</pre>
