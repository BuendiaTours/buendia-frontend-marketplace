<script lang="ts">
	import { createPagination, melt } from '@melt-ui/svelte';
	import { AltArrowLeft, AltArrowRight } from '$lib/icons/Linear';

	type Props = {
		count: number;
		perPage?: number;
		siblingCount?: number;
		onPageChange?: (page: number) => void;
	};

	let { count, perPage = 10, siblingCount = 1, onPageChange }: Props = $props();

	const {
		elements: { root, pageTrigger, prevButton, nextButton },
		states: { pages },
		options
	} = createPagination({
		count: 0,
		perPage: 10,
		defaultPage: 1,
		siblingCount: 1,
		onPageChange: ({ next }) => {
			onPageChange?.(next);
			return next;
		}
	});

	$effect(() => {
		options.count.set(count);
		options.perPage.set(perPage);
		options.siblingCount.set(siblingCount);
	});
</script>

<nav use:melt={$root} class="my-8 flex items-center justify-center gap-2">
	<button
		use:melt={$prevButton}
		class="rounded border border-neutral-200 p-1.5 hover:bg-neutral-100 data-disabled:pointer-events-none data-disabled:opacity-40"
	>
		<AltArrowLeft class="size-5" />
	</button>

	<div class="flex gap-1">
		{#each $pages as page (page.key)}
			{#if page.type === 'ellipsis'}
				<div class="px-3 py-1.5 text-sm opacity-40 select-none">...</div>
			{:else}
				<button
					use:melt={$pageTrigger(page)}
					class="rounded border border-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-100 data-selected:border-neutral-900 data-selected:bg-neutral-900 data-selected:text-white"
				>
					{page.value}
				</button>
			{/if}
		{/each}
	</div>

	<button
		use:melt={$nextButton}
		class="rounded border border-neutral-200 p-1.5 hover:bg-neutral-100 data-disabled:pointer-events-none data-disabled:opacity-40"
	>
		<AltArrowRight class="size-5" />
	</button>
</nav>
