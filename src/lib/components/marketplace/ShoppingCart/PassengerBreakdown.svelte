<script lang="ts">
	import type { PassengerLineItem } from '$lib/types';
	import { formatEuro } from '$lib/utils/currency';
	import * as m from '$paraglide/messages';

	type Props = {
		items: PassengerLineItem[];
		class?: string;
		itemClass?: string;
	};

	let { items, class: className = '', itemClass = '' }: Props = $props();

	const messages = m as unknown as Record<string, () => string>;
</script>

<ul class={className}>
	{#each items.filter((i) => i.count > 0) as item (item.group)}
		<li class={itemClass}>
			{item.count}
			{messages[`enum_passengerKind_${item.group}_name`]?.() ?? item.group}
			×
			{formatEuro(item.unitPrice)}
		</li>
	{/each}
</ul>
