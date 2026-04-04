<script lang="ts">
	import * as m from '$paraglide/messages';
	import { Chart, Svg, Bars, Axis, Highlight, Tooltip } from 'layerchart';
	import { scaleBand } from 'd3-scale';
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

	function formatDate(date: string): string {
		return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
	}
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
			<Chart
				data={parsedData}
				x="label"
				xScale={scaleBand().padding(0.2)}
				y={showSplit ? ['ap', 'ft'] : 'total'}
				yDomain={[0, null]}
				yNice
				padding={{ left: 40, bottom: 24, right: 8, top: 8 }}
				tooltip={{ mode: 'band' }}
			>
				<Svg>
					<Axis placement="left" />
					<Axis placement="bottom" />
					{#if showSplit}
						<Bars y="ap" class="fill-primary" radius={2} />
						<Bars y="ft" class="fill-secondary" offset={4} radius={2} />
					{:else}
						<Bars y="total" class="fill-primary" radius={2} />
					{/if}
					<Highlight area />
				</Svg>
				<Tooltip.Root let:data>
					<Tooltip.Header>
						{data.label}
					</Tooltip.Header>
					{#if showSplit}
						<Tooltip.Item label={m.analytics_chart_paidTour()} value={String(data.ap)} />
						<Tooltip.Item label={m.analytics_chart_freeTour()} value={String(data.ft)} />
					{:else}
						<Tooltip.Item label="Total" value={String(data.total)} />
					{/if}
				</Tooltip.Root>
			</Chart>
		</div>
	{:else}
		<p class="text-base-content/40 py-8 text-center text-sm">{m.analytics_noData()}</p>
	{/if}
</div>
