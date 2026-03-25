<script lang="ts">
	import type { ActivityCard } from '$lib/types';
	import { ByBuendia } from '$lib/icons/Linear';
	import StarRating from './StarRating.svelte';
	import Badge from './Badge.svelte';

	type Props = {
		item: ActivityCard;
		wrapperClass?: string;
	};

	let { item, wrapperClass }: Props = $props();
</script>

<article class="c-activity-card sm:flex {wrapperClass}">
	<a
		href={item.slug}
		class="flex min-h-[190px] gap-3 sm:relative sm:min-h-[372px] sm:basis-full sm:flex-col"
	>
		<div class="shrink-0 grow-0 basis-[140px] overflow-hidden rounded-lg sm:basis-[166px]">
			<img src={item.image} alt={item.name} class="h-full w-full object-cover" />
		</div>
		<div class="flex shrink grow-0 basis-full flex-col gap-2">
			{#if item.byBuendia}
				<div class="sm:-mt-[41px] sm:-ml-[1px]">
					<div
						class="inline-flex items-center gap-[6px] sm:rounded-tr-lg sm:bg-white sm:pt-2 sm:pr-3 sm:pb-[2px]"
					>
						<ByBuendia size={16} />
						<span class="p-sm font-bold text-neutral-800">Plan by buendía</span>
					</div>
				</div>
			{/if}
			{#if item.isNew}
				<div class="sm:absolute sm:top-2 sm:left-2">
					<Badge
						data={{
							icon: 'Bookmark',
							title: 'Novedad',
							color: 'bg-blue-300'
						}}
					/>
				</div>
			{/if}
			<h3 class="h3">
				{item.name}
			</h3>
			{#if item.infoList.length > 0}
				<ul class="flex flex-wrap gap-[6px]">
					{#each item.infoList as info (info.id)}
						<li class="p-xs flex gap-[6px] text-neutral-700 not-first:before:content-['·']">
							{info.infoName}
						</li>
					{/each}
				</ul>
			{/if}
			<p class="p-xs text-neutral-700">{item.cancellation}</p>
			<div class="mt-2 flex shrink grow-0 basis-full items-end justify-between">
				<div>
					{#if item.price}
						<p class="p-xs text-neutral-800">
							Desde {#if item.discount}<span class="line-through">{item.price} €</span>{/if}
						</p>
						{#if item.discount}
							<p class="text-price text-salmon-700">{item.discount} €</p>
						{:else}
							<p class="text-price text-neutral-800">{item.price} €</p>
						{/if}
					{/if}
					{#if item.isFreeTour}
						<p class="text-price text-neutral-800">Gratis</p>
					{/if}
				</div>
				{#if item.rating}
					<div class="flex items-center gap-1">
						<StarRating single size="sm" />
						<span class="p-lg font-bold">{item.rating}</span>
						{#if item.opinions}
							<span class="p-sm text-neutral-600">({item.opinions})</span>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</a>
</article>
