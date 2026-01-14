<!-- https://www.bits-ui.com/docs/components/pagination -->
<script lang="ts">
	import { Pagination as PaginationPrimitive } from 'bits-ui';
	import { NavArrowLeft, NavArrowRight } from 'svelte-iconoir';

	type Props = {
		count: number;
		perPage?: number;
		siblingCount?: number;
		onPageChange?: (page: number) => void;
	};

	let { count, perPage = 10, siblingCount = 1, onPageChange }: Props = $props();
</script>

<PaginationPrimitive.Root {count} {perPage} {siblingCount} {onPageChange}>
	{#snippet children({ pages, range })}
		<div class="my-8 flex items-center justify-center">
			<PaginationPrimitive.PrevButton class="btn mr-2 btn-ghost btn-sm disabled:btn-disabled">
				<NavArrowLeft class="size-5" />
			</PaginationPrimitive.PrevButton>

			<div class="join">
				{#each pages as page (page.key)}
					{#if page.type === 'ellipsis'}
						<div class="btn btn-disabled join-item btn-sm select-none">...</div>
					{:else}
						<PaginationPrimitive.Page {page} class="btn join-item btn-sm data-selected:btn-active">
							{page.value}
						</PaginationPrimitive.Page>
					{/if}
				{/each}
			</div>

			<PaginationPrimitive.NextButton class="btn ml-2 btn-ghost btn-sm disabled:btn-disabled">
				<NavArrowRight class="size-5" />
			</PaginationPrimitive.NextButton>
		</div>

		<!-- <p class="text-center text-sm opacity-60">
			Mostrando {range.start} - {range.end} de {count}
		</p> -->
	{/snippet}
</PaginationPrimitive.Root>
