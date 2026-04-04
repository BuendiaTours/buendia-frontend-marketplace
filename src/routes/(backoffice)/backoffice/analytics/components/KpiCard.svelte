<script lang="ts">
	import * as m from '$paraglide/messages';

	type KpiFormat = 'currency' | 'integer' | 'decimal' | 'percent';

	type Props = {
		title: string;
		value: number;
		previousValue: number | null;
		variationPercent: number | null;
		format: KpiFormat;
		invertColor?: boolean;
	};

	let {
		title,
		value,
		previousValue,
		variationPercent,
		format,
		invertColor = false
	}: Props = $props();

	const formattedValue = $derived(formatValue(value, format));
	const formattedPrevious = $derived(
		previousValue !== null ? formatValue(previousValue, format) : null
	);
	const isPositive = $derived(variationPercent !== null && variationPercent >= 0);
	const badgeClass = $derived(getBadgeClass(isPositive, invertColor));
	const arrow = $derived(isPositive ? '\u2191' : '\u2193');

	function formatValue(val: number, fmt: KpiFormat): string {
		switch (fmt) {
			case 'currency':
				return new Intl.NumberFormat('es-ES', {
					style: 'currency',
					currency: 'EUR',
					minimumFractionDigits: 2
				}).format(val / 100);
			case 'integer':
				return new Intl.NumberFormat('es-ES').format(val);
			case 'decimal':
				return new Intl.NumberFormat('es-ES', {
					minimumFractionDigits: 1,
					maximumFractionDigits: 1
				}).format(val);
			case 'percent':
				return new Intl.NumberFormat('es-ES', {
					style: 'percent',
					minimumFractionDigits: 1,
					maximumFractionDigits: 1
				}).format(val);
		}
	}

	function getBadgeClass(positive: boolean, invert: boolean): string {
		const isGood = invert ? !positive : positive;
		return isGood ? 'badge-success' : 'badge-error';
	}
</script>

<div class="card bg-base-100 border-base-content/10 border p-4">
	<p class="text-base-content/60 text-xs font-medium tracking-wide uppercase">{title}</p>
	<p class="mt-1 text-2xl font-bold">{formattedValue}</p>

	{#if variationPercent !== null}
		<div class="mt-2 flex items-center gap-2">
			<span class="badge badge-sm {badgeClass}">
				{arrow}
				{Math.abs(variationPercent).toFixed(1)}%
			</span>
			{#if formattedPrevious}
				<span class="text-base-content/40 text-xs">
					{formattedPrevious}
					{m.analytics_kpi_vsPrevious()}
				</span>
			{/if}
		</div>
	{/if}
</div>
