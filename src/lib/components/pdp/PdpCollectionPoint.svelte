<script lang="ts">
	import { MapPoint } from '$lib/icons/Linear';
	import type { ActivityMeetingPoint } from '$lib/types';

	type Props = {
		data: ActivityMeetingPoint;
	};

	let { data }: Props = $props();

	const mapsUrl = $derived.by(() => {
		if (!data.location) return null;
		const [lng, lat] = data.location.coordinates;
		return `https://www.google.com/maps?q=${lat},${lng}`;
	});

	const addressLine = $derived.by(() => {
		const mainParts: string[] = [];
		if (data.address) mainParts.push(data.address);
		const locationParts: string[] = [];
		if (data.postCode) locationParts.push(data.postCode);
		if (data.city) locationParts.push(data.city);
		if (data.countryCode) locationParts.push(`(${data.countryCode})`);
		const locationStr = locationParts.join(' ');
		if (locationStr) mainParts.push(locationStr);
		return mainParts.join(', ');
	});
</script>

<div class="pdp-collection-point flex items-start gap-2">
	<MapPoint class="mt-0.5 size-5 shrink-0 text-black" />
	<div class="flex flex-1 flex-col">
		<div class="flex flex-col items-start justify-between gap-1.5 sm:flex-row">
			<span class="p-base font-bold">{data.name}</span>
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
		{#if addressLine}<p class="p-base">{addressLine}</p>{/if}
	</div>
</div>
