<script lang="ts">
	import { InfoCircle } from '$lib/icons/Linear';

	type Props = {
		ctaLabel?: string;
		disclaimer?: string;
		items?: Array<{
			id: string;
			order: number;
			name: string;
			description?: string;
			kind: string;
			duration?: string;
			location?: { type: string; coordinates: [number, number] };
		}>;
		wrapperClass?: string;
		onclick?: () => void;
	};

	let {
		ctaLabel = 'Ver mapa',
		disclaimer = 'Los itinerarios pueden estar sujetos a cambios',
		items,
		wrapperClass = '',
		onclick
	}: Props = $props();

	const mapsUrl = $derived(() => {
		const waypoints = (items ?? [])
			.filter((item) => item.location?.coordinates)
			.sort((a, b) => a.order - b.order)
			.map((item) => {
				const [lng, lat] = item.location?.coordinates ?? [];
				return `${lat},${lng}`;
			});
		if (waypoints.length === 0) return null;
		return `https://www.google.com/maps/dir/${waypoints.join('/')}`;
	});
</script>

<div class="c-map-view flex flex-col gap-4 sm:gap-8 {wrapperClass}">
	<div
		class="c-map-view__map relative flex min-h-[142px] items-center justify-center overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-[url('/marketplace/map.svg')] bg-cover bg-center"
	>
		{#if mapsUrl()}
			<a
				href={mapsUrl()}
				target="_blank"
				rel="noopener noreferrer"
				class="e-button e-button-tertiary"
				{onclick}
			>
				{ctaLabel}
			</a>
		{:else}
			<button class="e-button e-button-tertiary" {onclick}>
				{ctaLabel}
			</button>
		{/if}
	</div>
	{#if disclaimer}
		<div class="c-map-view__disclaimer flex items-start gap-1.5">
			<InfoCircle class="size-5 text-neutral-600" />
			<span class="p-sm text-neutral-700">{disclaimer}</span>
		</div>
	{/if}
</div>
