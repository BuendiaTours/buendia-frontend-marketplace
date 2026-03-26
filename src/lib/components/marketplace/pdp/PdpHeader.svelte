<script lang="ts">
	import Breadcrumbs from './../Breadcrumbs.svelte';
	import type { BreadcrumbItem } from '$lib/types';
	import StarRating from './../StarRating.svelte';
	import Badge from './../Badge.svelte';

	type Props = {
		dataBreadcrumbs: BreadcrumbItem[];
		title?: string;
		wrapperClass?: string;
		reviewsCount?: number;
	};

	let { dataBreadcrumbs, title, wrapperClass, reviewsCount }: Props = $props();
</script>

<div class="pdp-header {wrapperClass}">
	<Breadcrumbs items={dataBreadcrumbs} />
	<h1 class="h1 pt-2 pb-4">
		{title}
	</h1>
	<div class="flex flex-wrap items-center justify-between sm:flex-nowrap">
		<div class="mb-4 flex w-full flex-none gap-2 sm:mb-0 sm:w-auto sm:flex-auto">
			<StarRating value={4.5} size="md" />
			<span class="p-lg font-bold text-neutral-800">4.5</span>
			{#if reviewsCount !== undefined && reviewsCount > 0}
				<a
					href="#reviews"
					class="p-base ml-1 cursor-pointer font-bold text-neutral-800 underline underline-offset-8"
					>{reviewsCount} opiniones</a
				>
			{/if}
		</div>
		<Badge
			data={{
				icon: 'FireMinimalistic',
				title: 'Top ventas',
				color: 'bg-ochre-soft text-neutral-800'
			}}
		/>
	</div>
</div>
