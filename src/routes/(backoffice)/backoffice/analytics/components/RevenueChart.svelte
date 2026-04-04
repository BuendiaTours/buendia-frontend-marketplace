<script lang="ts">
	import * as m from '$paraglide/messages';
	import { Chart, Svg, Area, Axis, Highlight, Line, Tooltip } from 'layerchart';
	import { scaleBand, scaleTime } from 'd3-scale';
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
			<Chart
				data={parsedData}
				x="date"
				xScale={scaleTime()}
				y={showSplit ? ['gmvAPEur', 'gmvFTEur'] : 'gmvEur'}
				yDomain={[0, null]}
				yNice
				padding={{ left: 60, bottom: 24, right: 8, top: 8 }}
				tooltip={{ mode: 'bisect-x' }}
			>
				<Svg>
					<Axis placement="left" format={(v) => formatCurrency(v)} />
					<Axis placement="bottom" format={(v) => formatDate(v)} />
					{#if showSplit}
						<Area y="gmvAPEur" class="fill-primary/20" />
						<Line y="gmvAPEur" class="stroke-primary stroke-2" />
						<Area y="gmvFTEur" class="fill-secondary/20" />
						<Line y="gmvFTEur" class="stroke-secondary stroke-2" />
					{:else}
						<Area y="gmvEur" class="fill-primary/20" />
						<Line y="gmvEur" class="stroke-primary stroke-2" />
						<Area y="commissionEur" class="fill-success/20" />
						<Line y="commissionEur" class="stroke-success stroke-2" />
					{/if}
					<Highlight area />
				</Svg>
				<Tooltip.Root let:data>
					<Tooltip.Header>
						{formatDate(data.date)}
					</Tooltip.Header>
					{#if showSplit}
						<Tooltip.Item
							label={m.analytics_chart_paidTour()}
							value={formatCurrency(data.gmvAPEur)}
						/>
						<Tooltip.Item
							label={m.analytics_chart_freeTour()}
							value={formatCurrency(data.gmvFTEur)}
						/>
					{:else}
						<Tooltip.Item label={m.analytics_chart_gmv()} value={formatCurrency(data.gmvEur)} />
						<Tooltip.Item
							label={m.analytics_chart_commission()}
							value={formatCurrency(data.commissionEur)}
						/>
					{/if}
				</Tooltip.Root>
			</Chart>
		</div>
	{:else}
		<p class="text-base-content/40 py-8 text-center text-sm">{m.analytics_noData()}</p>
	{/if}
</div>
