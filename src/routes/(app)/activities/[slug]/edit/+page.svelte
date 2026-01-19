<script lang="ts">
	import type { ActivityDetail } from '$lib/types';
	import { page } from '$app/stores';

	export let data: { activity: ActivityDetail };
	const { activity } = data;
</script>

<p><a href={`/activities?${$page.url.searchParams.toString()}`}>← Volver al listado</a></p>

<h1>Editar Actividad</h1>

<pre class="overflow-x-auto rounded-box bg-base-200 p-4 text-xs">{JSON.stringify(
		activity,
		null,
		2
	)}</pre>
