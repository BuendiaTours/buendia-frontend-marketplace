<script lang="ts">
	import * as m from '$paraglide/messages';
	import type { TopDestinationItem } from '$core/analytics/types';

	type Props = {
		destinations: TopDestinationItem[];
	};

	let { destinations }: Props = $props();

	function formatCurrency(cents: number): string {
		return new Intl.NumberFormat('es-ES', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 0
		}).format(cents / 100);
	}
</script>

<div class="card bg-base-100 border-base-content/10 border p-4">
	<h3 class="mb-3 text-sm font-semibold">{m.analytics_table_topDestinations()}</h3>

	{#if destinations.length > 0}
		<div class="overflow-x-auto">
			<table class="table-sm table">
				<thead>
					<tr>
						<th>{m.analytics_destination_name()}</th>
						<th>{m.analytics_destination_kind()}</th>
						<th class="text-right">{m.analytics_destination_bookings()}</th>
						<th class="text-right">{m.analytics_destination_gmv()}</th>
						<th class="text-right">{m.analytics_destination_avgBookingValue()}</th>
					</tr>
				</thead>
				<tbody>
					{#each destinations as dest (dest.locationId)}
						<tr>
							<td class="font-medium">{dest.locationName}</td>
							<td>
								<span class="badge badge-sm badge-ghost">{dest.locationKind}</span>
							</td>
							<td class="text-right">{dest.bookings}</td>
							<td class="text-right">{formatCurrency(dest.gmv)}</td>
							<td class="text-right">{formatCurrency(dest.avgBookingValue)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p class="text-base-content/40 py-6 text-center text-sm">{m.analytics_noData()}</p>
	{/if}
</div>
