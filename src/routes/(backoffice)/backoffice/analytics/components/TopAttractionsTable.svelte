<script lang="ts">
	import * as m from '$paraglide/messages';
	import type { TopAttractionItem } from '$core/analytics/types';

	type Props = {
		attractions: TopAttractionItem[];
	};

	let { attractions }: Props = $props();

	function formatCurrency(cents: number): string {
		return new Intl.NumberFormat('es-ES', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 0
		}).format(cents / 100);
	}
</script>

<div class="card bg-base-100 border-base-content/10 border p-4">
	<h3 class="mb-3 text-sm font-semibold">{m.analytics_table_topAttractions()}</h3>

	{#if attractions.length > 0}
		<div class="overflow-x-auto">
			<table class="table-sm table">
				<thead>
					<tr>
						<th>{m.analytics_attraction_name()}</th>
						<th class="text-right">{m.analytics_attraction_bookings()}</th>
						<th class="text-right">{m.analytics_attraction_gmv()}</th>
						<th class="text-right">{m.analytics_attraction_commission()}</th>
						<th class="text-right">{m.analytics_attraction_avgBookingValue()}</th>
					</tr>
				</thead>
				<tbody>
					{#each attractions as attr (attr.attractionId)}
						<tr>
							<td class="font-medium">{attr.attractionName}</td>
							<td class="text-right">{attr.bookings}</td>
							<td class="text-right">{formatCurrency(attr.gmv)}</td>
							<td class="text-right">{formatCurrency(attr.commission)}</td>
							<td class="text-right">{formatCurrency(attr.avgBookingValue)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p class="text-base-content/40 py-6 text-center text-sm">{m.analytics_noData()}</p>
	{/if}
</div>
