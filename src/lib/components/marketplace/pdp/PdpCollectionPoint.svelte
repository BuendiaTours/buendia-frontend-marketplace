<script lang="ts">
	import { MapPoint } from '$lib/icons/Linear';
	import type { ActivityOptionPickupLocation } from '$lib/types';

	type Props = {
		data: ActivityOptionPickupLocation;
	};

	let { data }: Props = $props();

	const mapsUrl = $derived.by(() => {
		if (!data.location) return null;
		const [lng, lat] = data.location.coordinates;
		return `https://www.google.com/maps?q=${lat},${lng}`;
	});
</script>

<div class="pdp-collection-point flex items-start gap-2">
	<MapPoint class="mt-0.5 size-5 shrink-0 text-black" />
	<div class="flex flex-1 flex-col gap-2">
		<div class="flex flex-col items-start justify-between gap-1.5 sm:flex-row">
			<span class="p-base font-bold">{data.description}</span>
			{#if mapsUrl}
				<a
					href={mapsUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="p-sm shrink-0 font-semibold underline"
				>
					Abrir en Google Maps
				</a>
			{/if}
		</div>
		{#if data.timeOfDay}
			<span class="p-sm text-neutral-700">{data.timeOfDay}</span>
		{/if}
	</div>
</div>
