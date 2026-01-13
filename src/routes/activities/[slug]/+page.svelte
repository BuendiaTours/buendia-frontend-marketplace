<script lang="ts">
	import type { ActivityDetail } from '$lib/types';

	export let data: { activity: ActivityDetail };
	const { activity } = data;
</script>

<p><a href="/activities">← Volver al listado</a></p>

<h1>{activity.title}</h1>
<p>{activity.city} — {activity.priceFrom} {activity.currency}</p>

<h2>Descripción</h2>
<p>{activity.description}</p>

{#if activity.highlights?.length}
	<h3>Highlights</h3>
	<ul>
		{#each activity.highlights as h}
			<li>{h}</li>
		{/each}
	</ul>
{/if}
