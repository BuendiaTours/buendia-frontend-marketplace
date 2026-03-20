<script lang="ts">
	import type { Component } from 'svelte';
	import SvelteMarkdown from '@humanspeak/svelte-markdown';
	import { Bus, Tram, MapPoint, MapPinCheck } from '$lib/icons/Linear';

	type Props = {
		name: string;
		description?: string;
		kind: string;
		duration?: string;
		index?: number;
		total?: number;
	};

	const TRANSFER_ICONS: Record<string, Component> = {
		TRANSFER_BUS: Bus,
		TRANSFER_TRAIN: Tram,
		TRANSFER_BOAT: Bus
	};

	let { name, description, kind, duration, index = 0, total = 0 }: Props = $props();

	const isCounter = $derived(kind === 'EXPERIENCE' && index !== 0 && index !== total - 1);
	const isFirst = $derived(index === 0);
	const isLast = $derived(index === total - 1);
	const isStartEnd = $derived(isFirst || isLast);
	const TransferIcon = $derived(isStartEnd ? null : (TRANSFER_ICONS[kind] ?? null));
	const StartEndIcon = $derived(isFirst ? MapPoint : isLast ? MapPinCheck : null);
</script>

<div
	class="stage-item flex items-start gap-3"
	class:pb-8={!isLast}
	class:counter={isCounter}
	class:last={isLast}
	class:transfer={TransferIcon}
>
	{#if StartEndIcon}
		<div class="shrink-0 grow-0 basis-6 rounded-full bg-blue-700 p-3">
			<StartEndIcon class="size-6 text-white" />
		</div>
	{:else if TransferIcon}
		<div class="rounded-xl border border-solid border-neutral-300 bg-white p-3">
			<TransferIcon class="size-6 text-neutral-800" />
		</div>
	{/if}
	<div class="flex flex-col gap-[2px]">
		<p class="p-lg font-bold text-neutral-800">
			{name}
		</p>
		{#if description}
			<div class="p text-neutral-700">
				<SvelteMarkdown source={description} />
			</div>
		{/if}
		{#if duration}
			<p class="p-sm text-neutral-700">
				{duration}
			</p>
		{/if}
	</div>
</div>
