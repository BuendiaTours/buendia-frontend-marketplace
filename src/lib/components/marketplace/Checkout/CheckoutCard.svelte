<script lang="ts">
	import * as Icons from '$lib/icons/Linear';
	import type { Component, Snippet } from 'svelte';
	import StarRating from '../StarRating.svelte';
	import { formatEuro } from '$lib/utils/currency';
	import { createPopover, melt } from '@melt-ui/svelte';
	import type { PassengerLineItem } from '$lib/types';
	import PassengerBreakdown from '../ShoppingCart/PassengerBreakdown.svelte';

	type Variant = 'DEFAULT' | 'IS_BUENDIA';

	type Props = {
		actions?: Snippet;
		currentPrice?: number;
		disabled?: boolean;
		image: string;
		list: Array<{ icon: string; text: string; iconColor?: string }>;
		opinions?: number;
		passengerItems?: PassengerLineItem[];
		previousPrice?: number;
		rating?: number;
		title: string;
		variant?: Variant;
		wrapperClass?: string;
	};

	let {
		actions,
		currentPrice,
		disabled,
		image,
		list,
		opinions,
		passengerItems,
		previousPrice,
		rating,
		title,
		variant = 'DEFAULT',
		wrapperClass
	}: Props = $props();

	function getIcon(name: string): Component | null {
		return (Icons[name as keyof typeof Icons] as Component) ?? null;
	}

	const ByBuendia = Icons.ByBuendia;

	const {
		elements: { trigger, content },
		states: { open }
	} = createPopover({
		forceVisible: true,
		positioning: { placement: 'top', gutter: 8 }
	});
</script>

<div
	class="co-checkout-card mb-5 flex flex-col gap-4 rounded-xl border border-solid border-neutral-300 p-3 {wrapperClass}"
>
	<div class="flex items-start gap-3">
		<div class="h-35 flex-[0_0_140px] overflow-hidden rounded-lg" class:opacity-50={disabled}>
			<img src={image} alt={title} class="h-full w-full object-cover" />
		</div>
		<div class="mb-3 flex flex-col gap-2">
			{#if variant === 'IS_BUENDIA'}
				<div class="flex items-center gap-1.5" class:opacity-50={disabled}>
					<ByBuendia size={16} />
					Plan by buendía
				</div>
			{/if}
			<h3 class="h3" class:opacity-50={disabled}>
				{title}
			</h3>
			{#if rating}
				<div class="flex items-center gap-1" class:opacity-50={disabled}>
					<StarRating single size="sm" />
					<span class="p-lg font-bold">{rating}</span>
					{#if opinions}
						<span class="p-sm mt-0.5 text-neutral-600">({opinions})</span>
					{/if}
				</div>
			{/if}
		</div>
	</div>
	<div class="flex flex-col gap-2" class:opacity-50={disabled}>
		{#each list as item, i (i)}
			{@const IconComponent = getIcon(item.icon)}
			<div class="p-sm flex gap-2 text-neutral-700">
				{#if IconComponent}
					<IconComponent size={20} class="flex-[0_0_20px] {item.iconColor}" />
				{/if}
				{item.text}
			</div>
		{/each}
	</div>
	<div class="flex items-end justify-between gap-12">
		<div class="co-checkout-card__actions flex w-full gap-4 sm:w-3/5">
			{@render actions?.()}
		</div>
		{#if previousPrice || currentPrice}
			<div class="flex flex-col items-end" class:opacity-50={disabled}>
				{#if previousPrice}
					<p class="p-xs text-neutral-800">
						<span class="line-through">{formatEuro(previousPrice)}</span>
					</p>
				{/if}
				{#if currentPrice}
					{#if passengerItems?.length}
						<button
							use:melt={$trigger}
							class="text-price cursor-pointer"
							class:text-salmon-700={previousPrice}
						>
							{formatEuro(currentPrice)}
						</button>
						{#if $open}
							<div
								use:melt={$content}
								class="z-50 rounded-lg border border-neutral-200 bg-white p-3 shadow-lg"
							>
								<PassengerBreakdown items={passengerItems} />
							</div>
						{/if}
					{:else}
						<p class="text-price" class:text-salmon-700={previousPrice}>
							{formatEuro(currentPrice)}
						</p>
					{/if}
				{/if}
			</div>
		{/if}
	</div>
</div>
