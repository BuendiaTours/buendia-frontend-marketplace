<script lang="ts">
	import { env } from '$env/dynamic/public';

	type Props = {
		coordinates: [number, number];
		zoom?: number;
		width?: number;
		height?: number;
		wrapperClass?: string;
	};

	let { coordinates, zoom = 15, width = 600, height = 300, wrapperClass = '' }: Props = $props();

	const mapUrl = $derived.by(() => {
		const [lng, lat] = coordinates;
		const key = env.PUBLIC_GOOGLE_MAPS_API_KEY;
		return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=color:red|${lat},${lng}&key=${key}`;
	});
</script>

<div class={wrapperClass}>
	<img src={mapUrl} alt="Mapa del punto de encuentro" class="w-full rounded-xl" />
</div>
