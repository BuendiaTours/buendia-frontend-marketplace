<script lang="ts">
	import type { ActivityDetail } from '$lib/types';
	import { page } from '$app/stores';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction } from '$lib/actions/confirmAction';

	export let data: { activity: ActivityDetail };
	const { activity } = data;
</script>

<div class="mb-4 flex items-center justify-between">
	<a href={`/activities?${$page.url.searchParams.toString()}`} class="link">
		← Volver al listado
	</a>

	<div class="flex gap-2">
		<a
			href={buildUrlWithFilters(`/activities/${activity.slug}/edit`, $page.url.searchParams)}
			class="btn btn-outline btn-primary"
		>
			Edit
		</a>

		<form
			method="POST"
			action={buildUrlWithFilters(`/activities/${activity.slug}/delete`, $page.url.searchParams)}
		>
			<button
				type="submit"
				class="btn btn-soft btn-error"
				use:confirmAction={{
					title: 'Eliminar elemento',
					message: '¿Seguro que quieres eliminar este elemento?',
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
		activity,
		null,
		2
	)}</pre>
