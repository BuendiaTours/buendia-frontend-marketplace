<script lang="ts">
	import * as m from '$paraglide/messages';
	import type { TopSupplierItem } from '$core/analytics/types';

	type Props = {
		suppliers: TopSupplierItem[];
	};

	let { suppliers }: Props = $props();

	function formatCurrency(cents: number): string {
		return new Intl.NumberFormat('es-ES', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 0
		}).format(cents / 100);
	}

	function formatPercent(rate: number): string {
		return (rate * 100).toFixed(1) + '%';
	}
</script>

<div class="card bg-base-100 border-base-content/10 border p-4">
	<h3 class="mb-3 text-sm font-semibold">{m.analytics_table_topSuppliers()}</h3>

	{#if suppliers.length > 0}
		<div class="overflow-x-auto">
			<table class="table-sm table">
				<thead>
					<tr>
						<th>{m.analytics_supplier_name()}</th>
						<th class="text-right">{m.analytics_supplier_bookings()}</th>
						<th class="text-right">{m.analytics_supplier_gmv()}</th>
						<th class="text-right">{m.analytics_supplier_commission()}</th>
						<th class="text-right">{m.analytics_supplier_cancellationRate()}</th>
					</tr>
				</thead>
				<tbody>
					{#each suppliers as supplier (supplier.supplierId)}
						<tr>
							<td class="font-medium">{supplier.supplierName}</td>
							<td class="text-right">{supplier.bookings}</td>
							<td class="text-right">{formatCurrency(supplier.gmv)}</td>
							<td class="text-right">{formatCurrency(supplier.commission)}</td>
							<td class="text-right">{formatPercent(supplier.cancellationRate)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p class="text-base-content/40 py-6 text-center text-sm">{m.analytics_noData()}</p>
	{/if}
</div>
