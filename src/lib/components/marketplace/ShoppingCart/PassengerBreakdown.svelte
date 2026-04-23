<script lang="ts">
	import type { PassengerLineItem } from '$lib/types';
	import { formatEuro } from '$lib/utils/currency';
	import * as m from '$paraglide/messages';

	type Props = {
		items: PassengerLineItem[];
		wrapperClass?: string;
	};

	let { items, wrapperClass }: Props = $props();

	const messages = m as unknown as Record<string, () => string>;
</script>

<table class="w-[180px] {wrapperClass}">
	<tbody>
		{#each items.filter((i) => i.count > 0) as item (item.group)}
			<tr>
				<td class="w-full">{messages[`enum_passengerKind_${item.group}_name`]?.() ?? item.group}</td
				>
				<td class="text-right tabular-nums">{item.count}</td>
				<td class="px-1 text-center">×</td>
				<td class="text-right tabular-nums">{formatEuro(item.unitPrice)}</td>
			</tr>
		{/each}
	</tbody>
</table>
