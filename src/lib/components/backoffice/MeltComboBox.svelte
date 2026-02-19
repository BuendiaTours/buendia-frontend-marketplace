<!--
Componente ComboBox con Melt-UI y estilos DaisyUI
https://melt-ui.com/docs/builders/combobox

Ejemplo de uso:
<MeltComboBox
  items={fruits}
  placeholder="Search a fruit"
  icon={OrangeSlice}
  type="single"
  bind:value={selectedValue}
/>

Soporta modo single y multiple.
-->

<script lang="ts">
	import { createCombobox, melt } from '@melt-ui/svelte';
	import { SortVertical, CheckSquare } from '@solar-icons/svelte/Outline';
	import type { Component } from 'svelte';
	import { untrack } from 'svelte';
	import { fly } from 'svelte/transition';

	type Item = {
		value: string;
		label: string;
	};

	type SingleProps = {
		type: 'single';
		value?: string;
		onValueChange?: (value: string | undefined) => void;
	};

	type MultipleProps = {
		type?: 'multiple';
		value?: string[];
		onValueChange?: (value: string[] | undefined) => void;
	};

	type BaseProps = {
		items?: Item[];
		placeholder?: string;
		name?: string;
		icon?: Component;
		class?: string;
	};

	type Props = BaseProps & (SingleProps | MultipleProps);

	let {
		items = [],
		placeholder = 'Search...',
		name,
		icon: Icon,
		class: className = 'w-full',
		type = 'multiple' as 'multiple' | 'single',
		value = $bindable(),
		onValueChange
	}: Props = $props();

	const {
		elements: { menu, input, option },
		states: { open, inputValue, touchedInput, selected },
		helpers: { isSelected }
	} = untrack(() =>
		createCombobox({
			forceVisible: true,
			multiple: type !== 'single',
			defaultSelected:
				type === 'single' && value
					? { value: value as string, label: items.find((i) => i.value === value)?.label || '' }
					: undefined,
			onSelectedChange: ({ next }) => {
				if (type === 'single') {
					const newValue = next?.value as string | undefined;
					// eslint-disable-next-line @typescript-eslint/no-explicit-any -- discriminated union type narrowing
					value = newValue as any;
					// eslint-disable-next-line @typescript-eslint/no-explicit-any -- discriminated union callback
					onValueChange?.(newValue as any);
				} else {
					const newValue = Array.isArray(next) ? next.map((item) => item.value as string) : [];
					// eslint-disable-next-line @typescript-eslint/no-explicit-any -- discriminated union type narrowing
					value = newValue as any;
					// eslint-disable-next-line @typescript-eslint/no-explicit-any -- discriminated union callback
					onValueChange?.(newValue as any);
				}
				return next;
			}
		})
	);

	const filteredItems = $derived(
		$touchedInput
			? items.filter((item) => item.label.toLowerCase().includes($inputValue.toLowerCase()))
			: items
	);

	// Sincronizar value externo con selected
	$effect(() => {
		if (type === 'single' && value !== $selected?.value) {
			const item = items.find((i) => i.value === value);
			if (item) {
				selected.set({ value: item.value, label: item.label });
			} else if (!value) {
				selected.set(undefined);
			}
		}
	});

	// Sincronizar inputValue con el label del item seleccionado en modo single
	$effect(() => {
		if (type === 'single' && $selected) {
			inputValue.set($selected.label || '');
		} else if (type === 'single' && !$selected) {
			inputValue.set('');
		}
	});

	const hasValue = $derived(type === 'single' ? !!value : Array.isArray(value) && value.length > 0);
</script>

<div class="relative {className}">
	{#if Icon}
		<Icon
			class={`absolute start-3 top-1/2 size-5 -translate-y-1/2 ${hasValue ? 'text-success opacity-100' : 'opacity-60'}`}
		/>
	{/if}
	<input
		use:melt={$input}
		class={`input text-success w-full bg-transparent pr-10 ${Icon ? 'pl-10' : 'pl-4'} ${hasValue ? 'border-success!' : ''}`}
		{placeholder}
		aria-label={placeholder}
		{name}
	/>
	<div class="absolute end-3 top-1/2 size-5 -translate-y-1/2 opacity-60">
		<SortVertical class="size-5" />
	</div>
</div>

{#if $open}
	<ul
		use:melt={$menu}
		class="melt-combobox-menu rounded-box bg-base-100 z-50 flex max-h-75 flex-col overflow-hidden border shadow-lg {className}"
		transition:fly={{ duration: 150, y: -5 }}
	>
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div class="flex max-h-full flex-col gap-0 overflow-y-auto px-2 py-2" tabindex="0">
			{#each filteredItems as item, index (index)}
				<li
					use:melt={$option({
						value: item.value,
						label: item.label
					})}
					class="data-highlighted:bg-base-200 data-highlighted:text-base-content relative cursor-pointer scroll-my-2 rounded-md py-2 pr-4 pl-4 data-disabled:opacity-50"
				>
					{#if $isSelected(item.value)}
						<div class="check">
							<CheckSquare class="size-4" />
						</div>
					{/if}
					<div class="pl-4">
						<span class="font-medium">{item.label}</span>
					</div>
				</li>
			{:else}
				<li class="relative cursor-pointer rounded-md py-2 pl-4 pr-4 text-sm opacity-60">
					No results found
				</li>
			{/each}
		</div>
	</ul>
{/if}

<style>
	.check {
		position: absolute;
		left: 0.5rem;
		top: 50%;
		z-index: 10;
		color: var(--color-success);
		translate: 0 calc(-50% + 1px);
	}
</style>
