<script lang="ts">
	import { Eye, EyeClosed } from '$lib/icons/Linear';
	import type { VariantDefinition } from '$lib/components/backoffice/SvelteImageCrop/types/variantsConfigTypes';

	let {
		crop,
		isActive = false,
		isSelected = false,
		isLowResolution = false,
		showToggle = false,
		onToggle,
		onSelect
	}: {
		crop: VariantDefinition;
		isActive?: boolean;
		isSelected?: boolean;
		isLowResolution?: boolean;
		showToggle?: boolean;
		onToggle: () => void;
		onSelect: () => void;
	} = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="sic-crop-variant card bg-base-100 border p-3 transition-colors"
	class:cursor-pointer={isActive}
	class:!border-warning={isLowResolution}
	class:!border-success={isSelected && !isLowResolution}
	class:!border-zinc-700={!isSelected && !isLowResolution}
	onclick={() => isActive && onSelect()}
	role="button"
	tabindex="0"
>
	<div class="flex items-center gap-3">
		<div class="btn btn-square btn-ghost btn-xs pointer-events-none">
			{#if isLowResolution}
				<Eye class="text-warning h-4 w-4" />
			{:else if isActive && isSelected}
				<Eye class="text-success h-4 w-4" />
			{:else}
				<EyeClosed class="h-4 w-4 opacity-50" />
			{/if}
		</div>
		<div class="flex-1">
			<div class="text-sm font-semibold">{crop.preset}</div>
			<div class="text-xs">
				{crop.format} • {crop.width}×{crop.height}
			</div>
		</div>
		{#if showToggle}
			<input
				type="checkbox"
				class="sic-toggle-variant toggle toggle-md toggle-success"
				checked={isActive}
				onclick={(e) => e.stopPropagation()}
				onchange={onToggle}
			/>
		{/if}
	</div>
</div>
