<!--
Componente ComboBox de Bits UI reutilizable con estilos DaisyUI
https://www.bits-ui.com/docs/components/combobox

Ejemplo de uso:
<ComboBox
  items={fruits}
  placeholder="Search a fruit"
  icon={OrangeSlice}
/>

IMPORTANTE: Para resetear correctamente el input visual cuando se limpia el valor externamente,
envuelve el componente en un bloque {#key} usando el valor como key:

{#key selectedValue}
  <ComboBox
    items={items}
    type="single"
    bind:value={selectedValue}
  />
{/key}

Esto fuerza la recreación del componente cuando el valor cambia, permitiendo que el
defaultValue se aplique correctamente y el input muestre el texto correcto.
-->

<script lang="ts">
	import { Combobox } from 'bits-ui';
	import { ArrowSeparateVertical, FastArrowUp, FastArrowDown, Check } from 'svelte-iconoir';
	import type { ComponentType } from 'svelte';

	interface Item {
		value: string;
		label: string;
	}

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
		icon?: ComponentType;
		width?: string;
	};

	type Props = BaseProps & (SingleProps | MultipleProps);

	let {
		items = [],
		placeholder = 'Search...',
		name,
		icon: Icon,
		width = '296px',
		type = 'multiple' as any,
		value = $bindable(),
		onValueChange
	}: Props = $props();

	let searchValue = $state('');

	const filteredItems = $derived(
		searchValue === ''
			? items
			: items.filter((item) => item.label.toLowerCase().includes(searchValue.toLowerCase()))
	);

	// Calcular el valor inicial del input basado en el value seleccionado
	const inputDefaultValue = $derived.by(() => {
		if (type === 'single' && value) {
			const selectedItem = items.find((item) => item.value === value);
			return selectedItem?.label || '';
		}
		return '';
	});
</script>

<Combobox.Root
	type={type as any}
	{name}
	{items}
	value={value as any}
	onValueChange={onValueChange as any}
	onOpenChange={(o) => {
		if (!o) searchValue = '';
	}}
>
	<div class="relative">
		{#if Icon}
			<Icon
				class={`absolute start-3 top-1/2 size-5 -translate-y-1/2 ${(type === 'single' ? !!value : Array.isArray(value) && value.length > 0) ? 'text-success opacity-100' : 'opacity-60'}`}
			/>
		{/if}
		<Combobox.Input
			defaultValue={inputDefaultValue}
			oninput={(e) => (searchValue = e.currentTarget.value)}
			class={`input w-[${width}] bg-transparent pr-10 ${Icon ? 'pl-10' : 'pl-4'} ${(type === 'single' ? !!value : Array.isArray(value) && value.length > 0) ? 'border-success' : ''}`}
			{placeholder}
			aria-label={placeholder}
		/>
		<Combobox.Trigger class="absolute end-3 top-1/2 size-5 -translate-y-1/2 opacity-60">
			<ArrowSeparateVertical class="size-5" />
		</Combobox.Trigger>
	</div>
	<Combobox.Portal>
		<Combobox.Content
			class="z-50 max-h-96 w-[var(--bits-combobox-anchor-width)] rounded-box border border-base-content/10 bg-base-100 shadow-lg outline-none"
			sideOffset={8}
		>
			<Combobox.ScrollUpButton class="flex w-full items-center justify-center py-2 opacity-60">
				<FastArrowUp class="size-4" />
			</Combobox.ScrollUpButton>
			<Combobox.Viewport class="p-2">
				{#each filteredItems as item, i (i + item.value)}
					<Combobox.Item
						class="rounded-btn flex h-10 w-full cursor-pointer items-center px-3 text-sm capitalize transition-colors outline-none hover:bg-base-200 data-[highlighted]:bg-base-200"
						value={item.value}
						label={item.label}
					>
						{#snippet children({ selected })}
							{item.label}
							{#if selected}
								<div class="ml-auto">
									<Check class="size-4" />
								</div>
							{/if}
						{/snippet}
					</Combobox.Item>
				{:else}
					<span class="block px-3 py-2 text-sm opacity-60"> No results found, try again. </span>
				{/each}
			</Combobox.Viewport>
			<Combobox.ScrollDownButton class="flex w-full items-center justify-center py-2 opacity-60">
				<FastArrowDown class="size-4" />
			</Combobox.ScrollDownButton>
		</Combobox.Content>
	</Combobox.Portal>
</Combobox.Root>
