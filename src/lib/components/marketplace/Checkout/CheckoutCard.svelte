<script lang="ts">
	import * as Icons from '$lib/icons/Linear';
	import type { Component } from 'svelte';
	import StarRating from '../StarRating.svelte';

	type Props = {
		disabled?: boolean;
		image: string;
		isBuendia?: boolean;
		list: Array<{ icon: string; text: string; iconColor?: string }>;
		opinions?: number;
		rating?: number;
		title: string;
		wrapperClass?: string;
	};

	let { isBuendia, image, title, rating, opinions, list, disabled, wrapperClass }: Props = $props();

	function getIcon(name: string): Component | null {
		return (Icons[name as keyof typeof Icons] as Component) ?? null;
	}

	const ByBuendia = Icons.ByBuendia;
	const CheckCircle = Icons.CheckCircle;
</script>

<div
	class="mb-5 flex flex-col gap-4 rounded-xl border border-solid border-neutral-300 p-3 {wrapperClass}"
>
	<div class="flex items-start gap-3">
		<div class="h-35 flex-[0_0_140px] overflow-hidden rounded-lg" class:opacity-50={disabled}>
			<img src={image} alt={title} class="h-full w-full object-cover" />
		</div>
		<div class="mb-3 flex flex-col gap-2">
			{#if isBuendia}
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
	<div class="flex items-end justify-between">
		<div class="flex gap-4">
			{#if disabled}
				<button type="button" class="p-base font-bold text-violet-500 underline underline-offset-4">
					Volver a añadir al carrito
				</button>
			{:else}
				<button type="button" class="p-base font-bold text-violet-500 underline underline-offset-4">
					Modificar
				</button>
				<button type="button" class="p-base font-bold text-violet-500 underline underline-offset-4">
					Eliminar
				</button>
			{/if}
		</div>
		<div class:opacity-50={disabled}>
			<p class="p-xs text-neutral-800">
				<span class="line-through">153,25 €</span>
			</p>
			<p class="text-price text-salmon-700">123,75 €</p>
		</div>
	</div>
</div>
