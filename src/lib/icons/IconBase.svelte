<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		alt?: string;
		color?: string;
		size?: string | number;
		strokeWidth?: string | number;
		mirrored?: boolean;
		children?: Snippet;
		class?: string;
		style?: string;
		[key: string]: unknown;
	};

	let {
		alt,
		color = 'currentColor',
		size = '1em',
		strokeWidth = 2,
		mirrored = false,
		children,
		class: className,
		style,
		...restProps
	}: Props = $props();

	const width = $derived(typeof size === 'number' ? `${size}px` : size);
	const height = $derived(typeof size === 'number' ? `${size}px` : size);
	const combinedStyle = $derived(`--icon-stroke-width: ${strokeWidth};${style ? ` ${style}` : ''}`);
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	{width}
	{height}
	{color}
	fill="none"
	viewBox="0 0 24 24"
	transform={mirrored ? 'scale(-1, 1)' : undefined}
	class={className}
	style={combinedStyle}
	{...restProps}
>
	{#if alt}<title>{alt}</title>{/if}
	{@render children?.()}
</svg>
