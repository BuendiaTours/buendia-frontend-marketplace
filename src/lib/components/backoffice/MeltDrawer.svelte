<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import { CloseSquare } from '@solar-icons/svelte/Outline';
	import { untrack } from 'svelte';
	import type { MeltDrawerConfig } from './MeltDrawer';
	import type { Snippet } from 'svelte';

	type Props = {
		open?: boolean;
		title?: string;
		config?: MeltDrawerConfig;
		children?: Snippet;
	};

	let { open = $bindable(false), title = '', config = {}, children }: Props = $props();

	const defaultConfig: MeltDrawerConfig = {
		side: 'right',
		showOverlay: true,
		width: 350,
		closeOnOutsideClick: true
	};

	const mergedConfig = $derived({ ...defaultConfig, ...config });

	const {
		elements: { overlay, content, title: titleEl, close, portalled },
		states: { open: dialogOpen }
	} = untrack(() =>
		createDialog({
			forceVisible: true,
			closeOnOutsideClick: mergedConfig.closeOnOutsideClick,
			onOpenChange: ({ next }) => {
				open = next;
				return next;
			}
		})
	);

	$effect(() => {
		if (open !== $dialogOpen) {
			dialogOpen.set(open);
		}
	});

	const sideClasses = $derived(
		mergedConfig.side === 'left'
			? 'left-0 top-0 border-r border-base-content/9'
			: mergedConfig.side === 'right'
				? 'right-0 top-0 border-l border-base-content/9'
				: mergedConfig.side === 'top'
					? 'left-0 top-0 right-0 border-t border-base-content/9'
					: // Bottom
						'left-0 bottom-0 right-0 border-b border-base-content/9'
	);

	const width = $derived(mergedConfig.width ?? 350);

	const flyConfig = $derived(
		mergedConfig.side === 'left'
			? { x: -width, duration: 300, opacity: 1 }
			: mergedConfig.side === 'right'
				? { x: width, duration: 300, opacity: 1 }
				: mergedConfig.side === 'top'
					? { y: -200, duration: 300, opacity: 1 }
					: { y: 200, duration: 300, opacity: 1 }
	);

	const dimensionClasses = $derived(
		mergedConfig.side === 'left' || mergedConfig.side === 'right' ? 'h-screen' : 'w-full h-auto'
	);

	const dimensionStyles = $derived(
		mergedConfig.side === 'left' || mergedConfig.side === 'right'
			? `width: 100%; max-width: ${width}px;`
			: 'max-height: 80vh;'
	);
</script>

{#if $dialogOpen}
	<div use:melt={$portalled}>
		{#if mergedConfig.showOverlay}
			<div
				use:melt={$overlay}
				class="fixed inset-0 z-50 bg-(--default-overlay-bg)"
				transition:fade={{ duration: 150 }}
			></div>
		{/if}
		<div
			use:melt={$content}
			class="fixed z-50 {sideClasses} {dimensionClasses} bg-base-100 p-6 shadow-lg focus:outline-none"
			style={dimensionStyles}
			transition:fly={flyConfig}
		>
			<button
				use:melt={$close}
				aria-label="Cerrar"
				class="btn btn-circle btn-ghost btn-sm absolute top-2 right-2"
			>
				<CloseSquare class="size-4" />
			</button>

			{#if title}
				<h2 use:melt={$titleEl} class="mb-4 pr-8 text-lg font-semibold">
					{title}
				</h2>
			{/if}

			<div class="overflow-y-auto" style="max-height: calc(100vh - 80px);">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}
