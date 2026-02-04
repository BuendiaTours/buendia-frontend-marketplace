<script lang="ts">
	import type { ActivityDetail } from '$lib/types';
	import { page } from '$app/state';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction } from '$lib/actions/confirmAction';
	import DebugApiJson from '$lib/components/debug/DebugApiJson.svelte';

	export let data: { activity: ActivityDetail };
	const { activity } = data;
</script>

<div
	class="bnd-main-actions sticky top-0 z-10 flex items-center justify-between gap-4 border-t border-base-content/10 bg-base-100 py-4"
>
	<a href={`/activities?${page.url.searchParams.toString()}`} class="link"> ← Volver al listado </a>

	<div class="flex gap-2">
		<a
			href={buildUrlWithFilters(`/activities/${activity.slug}/edit`, $page.url.searchParams)}
			class="btn btn-outline btn-primary"
		>
			Edit
		</a>

		<form
			method="POST"
			action={buildUrlWithFilters(`/activities/${activity.slug}/delete`, page.url.searchParams)}
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

<DebugApiJson data={activity} />
