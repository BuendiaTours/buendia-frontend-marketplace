<script lang="ts">
	import Breadcrumbs from './Breadcrumbs.svelte';
	import type { BreadcrumbItem } from '$lib/types';
	import StarRating from './StarRating.svelte';
	import Badge from './Badge.svelte';

	type Props = {
		dataBreadcrumbs: BreadcrumbItem[];
		title?: string;
		wrapperClass?: string;
	};

	let { dataBreadcrumbs, title, wrapperClass }: Props = $props();
</script>

<div class="pdp-header pt-5 {wrapperClass}">
	<Breadcrumbs items={dataBreadcrumbs} />
	<h1 class="h1 pt-2 pb-4">
		{title}
	</h1>
	<div
		class="flex flex-wrap items-center justify-between border-b border-solid border-neutral-200 pb-5 sm:flex-nowrap lg:pb-6"
	>
		<div class="mb-4 flex w-full flex-none gap-2 sm:mb-0 sm:w-auto sm:flex-auto">
			<StarRating value={4.5} size="md" />
			<span class="p-lg font-bold text-neutral-800">4.5</span>
			<a href="#reviews" class="p-base ml-1 font-bold text-neutral-800 underline underline-offset-8"
				>333 opiniones</a
			>
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
