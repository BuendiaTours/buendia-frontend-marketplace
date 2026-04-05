<script lang="ts">
	import * as m from '$paraglide/messages';
	import { BarChart, Tooltip, defaultChartPadding } from 'layerchart';
	import type { BookingsTimeSeriesPoint } from '$core/analytics/types';

	type Props = {
		data: BookingsTimeSeriesPoint[];
	};

	let { data }: Props = $props();

	let showSplit = $state(false);

	const parsedData = $derived(
		data.map((d) => ({
			...d,
			label: new Date(d.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
		}))
	);

	const series = $derived(
		showSplit
			? [
					{ key: 'ap', value: 'ap', color: 'var(--color-primary)' },
					{ key: 'ft', value: 'ft', color: 'var(--color-secondary)' }
				]
			: undefined
	);
</script>

<div class="card bg-base-100 border-base-content/10 border p-4">
	<div class="mb-3 flex items-center justify-between">
		<h3 class="text-sm font-semibold">{m.analytics_chart_bookings()}</h3>
		<label class="label cursor-pointer gap-2">
			<span class="label-text text-xs">{m.analytics_chart_splitApFt()}</span>
			<input type="checkbox" class="toggle toggle-xs toggle-primary" bind:checked={showSplit} />
		</label>
	</div>

	{#if parsedData.length > 0}
		<div class="h-64">
			<BarChart
				data={parsedData}
				x="label"
				y={showSplit ? 'ap' : 'total'}
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
							<div class="font-medium">{d.label}</div>
							{#if showSplit}
								<div>{m.analytics_chart_paidTour()}: {d.ap}</div>
								<div>{m.analytics_chart_freeTour()}: {d.ft}</div>
							{:else}
								<div>Total: {d.total}</div>
							{/if}
						{/snippet}
					</Tooltip.Root>
				{/snippet}
			</BarChart>
		</div>
	{:else}
		<p class="text-base-content/40 py-8 text-center text-sm">{m.analytics_noData()}</p>
	{/if}
</div>
