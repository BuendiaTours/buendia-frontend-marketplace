<script lang="ts">
	import * as m from '$paraglide/messages';
	import type { SuppliersSummary } from '$core/analytics/types';

	type Props = {
		summary: SuppliersSummary;
	};

	let { summary }: Props = $props();
</script>

<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
	<div class="card bg-base-100 border-base-content/10 border p-3">
		<p class="text-base-content/60 text-xs font-medium tracking-wide uppercase">
			{m.analytics_summary_totalSuppliers()}
		</p>
		<p class="mt-1 text-lg font-bold">
			{summary.activeSuppliers}
			<span class="text-base-content/40 text-sm font-normal">/ {summary.totalSuppliers}</span>
		</p>
	</div>
	<div class="card bg-base-100 border-base-content/10 border p-3">
		<p class="text-base-content/60 text-xs font-medium tracking-wide uppercase">
			{m.analytics_summary_activationRate()}
		</p>
		<p class="mt-1 text-lg font-bold">
			{(summary.activationRate * 100).toFixed(1)}%
		</p>
	</div>
	<div class="card bg-base-100 border-base-content/10 border p-3">
		<p class="text-base-content/60 text-xs font-medium tracking-wide uppercase">
			{m.analytics_summary_avgBookingsPerActive()}
		</p>
		<p class="mt-1 text-lg font-bold">
			{summary.avgBookingsPerActiveSupplier.toFixed(1)}
		</p>
	</div>
</div>
