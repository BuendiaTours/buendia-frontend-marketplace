<script lang="ts">
	import { Combobox, type WithoutChildrenOrChild, mergeProps } from 'bits-ui';

	type Props = Combobox.RootProps & {
		inputProps?: WithoutChildrenOrChild<Combobox.InputProps>;
		contentProps?: WithoutChildrenOrChild<Combobox.ContentProps>;
	};

	let {
		items = [],
		value = $bindable(),
		open = $bindable(false),
		inputProps,
		contentProps,
		type,
		...restProps
	}: Props = $props();

	let searchValue = $state('');

	const filteredItems = $derived.by(() => {
		if (searchValue === '') return items;
		return items.filter((item) => item.label.toLowerCase().includes(searchValue.toLowerCase()));
	});

	function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
		searchValue = e.currentTarget.value;
	}

	function handleOpenChange(newOpen: boolean) {
		if (!newOpen) searchValue = '';
	}

	const mergedRootProps = $derived(mergeProps(restProps, { onOpenChange: handleOpenChange }));
	const mergedInputProps = $derived(mergeProps(inputProps, { oninput: handleInput }));
</script>

<!--
Destructuring (required for bindable) and discriminated unions don't play well together,
so we cast the value to `never` to avoid type errors here. However, on the consumer
side, the component will still be type-checked correctly.
-->
<Combobox.Root {type} {items} bind:value={value as never} bind:open {...mergedRootProps}>
	<Combobox.Input {...mergedInputProps} />
	<Combobox.Trigger>Open</Combobox.Trigger>
	<Combobox.Portal>
		<Combobox.Content {...contentProps}>
			{#each filteredItems as item, i (i + item.value)}
				<Combobox.Item {...item}>
					{#snippet children({ selected })}
						{item.label}
						{selected ? '✅' : ''}
					{/snippet}
				</Combobox.Item>
			{:else}
				<span> No results found </span>
			{/each}
		</Combobox.Content>
	</Combobox.Portal>
</Combobox.Root>
