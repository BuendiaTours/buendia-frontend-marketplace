<script lang="ts">
	import { createPopover, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import { CartLarge4 } from '$lib/icons/Linear';
	import { cartStore } from '$lib/stores/shoppingCart.svelte';

	type Props = {
		title?: string;
		wrapperClass?: string;
	};

	let { title = 'Mi Aplicación', wrapperClass }: Props = $props();

	const {
		elements: { trigger, content },
		states: { open }
	} = createPopover({
		forceVisible: true,
		positioning: { placement: 'bottom-end', gutter: 8 }
	});
</script>

<header class="layout-header-area {wrapperClass}">
	<div class="wrapper flex items-center justify-between">
		Main header {title}

		<button use:melt={$trigger} class="relative p-2">
			<CartLarge4 class="size-6" />
			{#if cartStore.bookingCount > 0}
				<span
					class="p-xs absolute top-0 right-0 flex size-5 items-center justify-center rounded-full bg-red-500 font-bold text-white"
				>
					{cartStore.bookingCount}
				</span>
			{/if}
		</button>
	</div>
</header>

{#if $open}
	<div
		use:melt={$content}
		transition:fade={{ duration: 100 }}
		class="z-50 max-h-[80vh] w-[480px] overflow-auto rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
	>
		<p class="p-xs mb-2 font-bold tracking-wide text-gray-400">shoppingCart debug</p>
		<pre class="p-xs break-all whitespace-pre-wrap text-gray-700">{JSON.stringify(
				$state.snapshot(cartStore),
				null,
				2
			)}</pre>
	</div>
{/if}
