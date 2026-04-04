<script lang="ts">
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';

	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';
	import AnalyticsFilters from './components/AnalyticsFilters.svelte';
	import KpiCard from './components/KpiCard.svelte';
	import RevenueChart from './components/RevenueChart.svelte';
	import BookingsChart from './components/BookingsChart.svelte';
	import SupplierSummaryCards from './components/SupplierSummaryCards.svelte';
	import TopSuppliersTable from './components/TopSuppliersTable.svelte';
	import TopActivitiesTable from './components/TopActivitiesTable.svelte';

	let { data }: PageProps = $props();

	const kpis = $derived(data.kpis);
	const filters = $derived(data.filters);
	const revenueTimeSeries = $derived(data.revenueTimeSeries);
	const bookingsTimeSeries = $derived(data.bookingsTimeSeries);
	const topSuppliers = $derived(data.topSuppliers);
	const suppliersSummary = $derived(data.suppliersSummary);
	const topActivities = $derived(data.topActivities);
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
<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
	<KpiCard
		title={m.analytics_kpi_gmv()}
		value={kpis.gmv.value}
		previousValue={kpis.gmv.previousValue}
		variationPercent={kpis.gmv.variationPercent}
		format="currency"
	/>
	<KpiCard
		title={m.analytics_kpi_netRevenue()}
		value={kpis.netRevenue.value}
		previousValue={kpis.netRevenue.previousValue}
		variationPercent={kpis.netRevenue.variationPercent}
		format="currency"
	/>
	<KpiCard
		title={m.analytics_kpi_bookings()}
		value={kpis.bookings.value}
		previousValue={kpis.bookings.previousValue}
		variationPercent={kpis.bookings.variationPercent}
		format="integer"
	/>
	<KpiCard
		title={m.analytics_kpi_avgBookingValue()}
		value={kpis.avgBookingValue.value}
		previousValue={kpis.avgBookingValue.previousValue}
		variationPercent={kpis.avgBookingValue.variationPercent}
		format="currency"
	/>
	<KpiCard
		title={m.analytics_kpi_travellersPerBooking()}
		value={kpis.travellersPerBooking.value}
		previousValue={kpis.travellersPerBooking.previousValue}
		variationPercent={kpis.travellersPerBooking.variationPercent}
		format="decimal"
	/>
	<KpiCard
		title={m.analytics_kpi_cancellationRate()}
		value={kpis.cancellationRate.value}
		previousValue={kpis.cancellationRate.previousValue}
		variationPercent={kpis.cancellationRate.variationPercent}
		format="percent"
		invertColor
	/>
</div>

<!-- Time Series Charts -->
<div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
	<RevenueChart data={revenueTimeSeries} />
	<BookingsChart data={bookingsTimeSeries} />
</div>

<!-- Supplier Summary -->
<div class="mt-6">
	<SupplierSummaryCards summary={suppliersSummary} />
</div>

<!-- Ranking Tables -->
<div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
	<TopSuppliersTable suppliers={topSuppliers} />
	<TopActivitiesTable activities={topActivities} />
</div>
