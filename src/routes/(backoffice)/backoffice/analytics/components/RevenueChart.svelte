<script lang="ts">
	import * as m from '$paraglide/messages';
	import { LineChart, Tooltip, defaultChartPadding } from 'layerchart';
	import type { RevenueTimeSeriesPoint } from '$core/analytics/types';

	type Props = {
		data: RevenueTimeSeriesPoint[];
	};

	let { data }: Props = $props();

	let showSplit = $state(false);

	const parsedData = $derived(
		data.map((d) => ({
			...d,
			date: new Date(d.date),
			gmvEur: d.gmv / 100,
			commissionEur: d.commission / 100,
			gmvAPEur: d.gmvAP / 100,
			gmvFTEur: d.gmvFT / 100
		}))
	);

	const series = $derived(
		showSplit
			? [
					{ key: 'gmvAPEur', value: 'gmvAPEur', color: 'var(--color-primary)' },
					{ key: 'gmvFTEur', value: 'gmvFTEur', color: 'var(--color-secondary)' }
				]
			: [
					{ key: 'gmvEur', value: 'gmvEur', color: 'var(--color-primary)' },
					{ key: 'commissionEur', value: 'commissionEur', color: 'var(--color-success)' }
				]
	);

	function formatCurrency(val: number): string {
		return new Intl.NumberFormat('es-ES', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 0
		}).format(val);
	}

	function formatDate(date: Date): string {
		return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
	}
</script>

<div class="card bg-base-100 border-base-content/10 border p-4">
	<div class="mb-3 flex items-center justify-between">
		<h3 class="text-sm font-semibold">{m.analytics_chart_revenue()}</h3>
		<label class="label cursor-pointer gap-2">
			<span class="label-text text-xs">{m.analytics_chart_splitApFt()}</span>
			<input type="checkbox" class="toggle toggle-xs toggle-primary" bind:checked={showSplit} />
		</label>
	</div>

	{#if parsedData.length > 0}
		<div class="h-64">
			<LineChart
				data={parsedData}
				x="date"
				y={showSplit ? 'gmvAPEur' : 'gmvEur'}
				{series}
				padding={defaultChartPadding({ right: 10 })}
			>
				{#snippet tooltip({ context })}
					<Tooltip.Root
						x="data"
						y={context.height}
						anchor="top"
						variant="none"
						class="bg-base-100 border-base-content/10 rounded border px-2 py-1 text-xs shadow"
					>
						{#snippet children({ data: d })}
							<div class="font-medium">{formatDate(d.date)}</div>
							{#if showSplit}
								<div>{m.analytics_chart_paidTour()}: {formatCurrency(d.gmvAPEur)}</div>
								<div>{m.analytics_chart_freeTour()}: {formatCurrency(d.gmvFTEur)}</div>
							{:else}
								<div>{m.analytics_chart_gmv()}: {formatCurrency(d.gmvEur)}</div>
								<div>{m.analytics_chart_commission()}: {formatCurrency(d.commissionEur)}</div>
							{/if}
						{/snippet}
					</Tooltip.Root>
				{/snippet}
			</LineChart>
		</div>
	{:else}
		<p class="text-base-content/40 py-8 text-center text-sm">{m.analytics_noData()}</p>
	{/if}
</div>
