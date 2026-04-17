<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { AltArrowDown, AltArrowUp } from '$lib/icons/Linear';
	import type { Component } from 'svelte';
	import type { Readable } from 'svelte/store';

	type Props = {
		icon: Component<{ class?: string }>;
		disabled?: boolean;
		placeholder?: string;
		disabledPlaceholder?: string;
		value?: string | null;
		open?: boolean;
		wrapperClass?: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		trigger?: Readable<any>;
	};

	let {
		icon: Icon,
		disabled = false,
		placeholder = 'Seleccionar',
		disabledPlaceholder = 'No disponible',
		value = null,
		open = false,
		wrapperClass = '',
		trigger
	}: Props = $props();

	const btnClass = $derived(
		`flex w-full cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none${disabled ? ' !cursor-not-allowed' : ''}${wrapperClass ? ` ${wrapperClass}` : ''}`
	);
</script>

{#snippet content()}
	<Icon class="size-6" />
	<span class="p-base flex-1 text-left font-bold text-gray-700">
		{#if value}
			{value}
		{:else if disabled}
			{disabledPlaceholder}
		{:else}
			{placeholder}
		{/if}
	</span>
	{#if open}
		<AltArrowUp class="text-gray-400" size={16} />
	{:else}
		<AltArrowDown class="text-gray-400" size={16} />
	{/if}
{/snippet}

{#if trigger}
	{@const meltTrigger = $trigger}
	<button use:melt={meltTrigger} class={btnClass} {disabled}>
		{@render content()}
	</button>
{:else}
	<button class={btnClass} {disabled}>
		{@render content()}
	</button>
{/if}
