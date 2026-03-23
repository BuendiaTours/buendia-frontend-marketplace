<script lang="ts">
	import { InfoCircle } from '$lib/icons/Linear';

	type Props = {
		ctaLabel?: string;
		disclaimer?: string;
		wrapperClass?: string;
		onclick?: () => void;
	};

	let {
		ctaLabel = 'Ver mapa',
		disclaimer = 'Los itinerarios pueden estar sujetos a cambios',
		wrapperClass = '',
		onclick
	}: Props = $props();
</script>

<div class="c-map-view flex flex-col gap-4 sm:gap-8 {wrapperClass}">
	<div
		class="c-map-view__map relative flex min-h-[142px] items-center justify-center overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-[url('/marketplace/map.svg')] bg-cover bg-center"
	>
		<button class="e-button e-button-tertiary" {onclick}>
			{ctaLabel}
		</button>
	</div>
	{#if disclaimer}
		<div class="c-map-view__disclaimer flex items-start gap-1.5">
			<InfoCircle class="size-5 text-neutral-600" />
			<span class="p-sm text-neutral-700">{disclaimer}</span>
		</div>
	{/if}
</div>
