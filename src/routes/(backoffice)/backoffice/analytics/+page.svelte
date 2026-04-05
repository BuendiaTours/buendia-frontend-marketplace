<script lang="ts">
	import * as m from '$paraglide/messages';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';
	import AnalyticsFilters from './components/AnalyticsFilters.svelte';
	import KpiCard from './components/KpiCard.svelte';
	import RevenueChart from './components/RevenueChart.svelte';
	import BookingsChart from './components/BookingsChart.svelte';
	import SupplierSummaryCards from './components/SupplierSummaryCards.svelte';
	import TopSuppliersTable from './components/TopSuppliersTable.svelte';
	import TopActivitiesTable from './components/TopActivitiesTable.svelte';
	import TopDestinationsTable from './components/TopDestinationsTable.svelte';
	import TopAttractionsTable from './components/TopAttractionsTable.svelte';

	let { data }: PageProps = $props();

	/** Charts render client-only — LayerCake calls setContext in an effect, incompatible with SSR/hydration */
	let chartsReady = $state(false);
	onMount(() => {
		chartsReady = true;
	});

	const kpis = $derived(data.kpis);
	const filters = $derived(data.filters);
	const revenueTimeSeries = $derived(data.revenueTimeSeries);
	const bookingsTimeSeries = $derived(data.bookingsTimeSeries);
	const topSuppliers = $derived(data.topSuppliers);
	const suppliersSummary = $derived(data.suppliersSummary);
	const topActivities = $derived(data.topActivities);
	const topDestinations = $derived(data.topDestinations);
	const topAttractions = $derived(data.topAttractions);
</script>

<svelte:head>
	<title>{m.analytics_pageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.analytics_pageTitle()} breadcrumbs={data.breadcrumbs} />

<!-- Filters -->
<div class="mb-4">
	<AnalyticsFilters {filters} />
</div>

<!-- KPI Cards -->
{#if kpis}
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<KpiCard
			title={m.analytics_kpi_gmv()}
			value={kpis.gmv?.value ?? 0}
			previousValue={kpis.gmv?.previousValue ?? null}
			variationPercent={kpis.gmv?.variationPercent ?? null}
			format="currency"
		/>
		<KpiCard
			title={m.analytics_kpi_netRevenue()}
			value={kpis.netRevenue?.value ?? 0}
			previousValue={kpis.netRevenue?.previousValue ?? null}
			variationPercent={kpis.netRevenue?.variationPercent ?? null}
			format="currency"
		/>
		<KpiCard
			title={m.analytics_kpi_bookings()}
			value={kpis.bookings?.value ?? 0}
			previousValue={kpis.bookings?.previousValue ?? null}
			variationPercent={kpis.bookings?.variationPercent ?? null}
			format="integer"
		/>
		<KpiCard
			title={m.analytics_kpi_avgBookingValue()}
			value={kpis.avgBookingValue?.value ?? 0}
			previousValue={kpis.avgBookingValue?.previousValue ?? null}
			variationPercent={kpis.avgBookingValue?.variationPercent ?? null}
			format="currency"
		/>
		<KpiCard
			title={m.analytics_kpi_avgTravellers()}
			value={kpis.avgTravellers?.value ?? 0}
			previousValue={kpis.avgTravellers?.previousValue ?? null}
			variationPercent={kpis.avgTravellers?.variationPercent ?? null}
			format="decimal"
		/>
		<KpiCard
			title={m.analytics_kpi_cancellationRate()}
			value={kpis.cancellationRate?.value ?? 0}
			previousValue={kpis.cancellationRate?.previousValue ?? null}
			variationPercent={kpis.cancellationRate?.variationPercent ?? null}
			format="percent"
			invertColor
		/>
	</div>
{/if}

<!-- Time Series Charts (client-only — LayerChart uses setContext incompatible with SSR) -->
{#if chartsReady}
	<div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
		<RevenueChart data={revenueTimeSeries} />
		<BookingsChart data={bookingsTimeSeries} />
	</div>
{/if}

<!-- Supplier Summary -->
<div class="mt-6">
	<SupplierSummaryCards summary={suppliersSummary} />
</div>

<!-- Ranking Tables: Suppliers, Destinations, Attractions -->
<div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
	<TopSuppliersTable suppliers={topSuppliers} />
	<TopDestinationsTable destinations={topDestinations} />
	<TopAttractionsTable attractions={topAttractions} />
</div>

<!-- Top Activities (full width — more columns) -->
<div class="mt-4">
	<TopActivitiesTable activities={topActivities} />
</div>
