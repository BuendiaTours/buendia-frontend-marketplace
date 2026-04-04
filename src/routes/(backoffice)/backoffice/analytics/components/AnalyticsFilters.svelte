<script lang="ts">
	import * as m from '$paraglide/messages';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import type { PatchValue } from '$lib/utils/filters';
	import { patchFilters } from '$lib/utils/filters';
	import { analyticsFiltersSchema } from '../schemas/filters.schema';
	import type { AnalyticsDashboardFilters } from '../schemas/filters.schema';
	import { GRANULARITY_OPTIONS, ACTIVITY_KIND_FILTER_OPTIONS } from '$lib/labels/analytics';
	import FilterSelect from '$lib/components/backoffice/filters/FilterSelect.svelte';

	type Props = {
		filters: AnalyticsDashboardFilters & { dateFrom: string; dateTo: string; granularity: string };
	};

	let { filters }: Props = $props();

	// svelte-ignore state_referenced_locally
	let dateFrom = $state(filters.dateFrom);
	// svelte-ignore state_referenced_locally
	let dateTo = $state(filters.dateTo);

	$effect(() => {
		dateFrom = filters.dateFrom;
		dateTo = filters.dateTo;
	});

	function applyPatch(patch: {
		[K in keyof AnalyticsDashboardFilters]?: PatchValue<AnalyticsDashboardFilters[K]>;
	}) {
		const newParams = patchFilters(analyticsFiltersSchema, page.url.searchParams, patch);
		goto(`?${newParams.toString()}`, { keepFocus: true, noScroll: true });
	}

	function applyPreset(days: number) {
		const now = Date.now();
		const toDate = new Date(now).toISOString().split('T')[0];
		const fromDate = new Date(now - days * 86_400_000).toISOString().split('T')[0];
		applyPatch({ dateFrom: fromDate, dateTo: toDate });
	}

	function applyDateRange() {
		applyPatch({ dateFrom, dateTo });
	}

	function handleFilterChange(filterKey: string, value: string | null) {
		applyPatch({ [filterKey]: value });
	}
</script>

<div
	class="card bg-base-100 border-base-content/10 flex-row flex-wrap items-center gap-3 border p-3"
>
	<!-- Date presets -->
	<div class="flex gap-1">
		<button class="btn btn-xs btn-ghost" onclick={() => applyPreset(7)}>
			{m.analytics_preset_7d()}
		</button>
		<button class="btn btn-xs btn-ghost" onclick={() => applyPreset(30)}>
			{m.analytics_preset_30d()}
		</button>
		<button class="btn btn-xs btn-ghost" onclick={() => applyPreset(90)}>
			{m.analytics_preset_3m()}
		</button>
		<button class="btn btn-xs btn-ghost" onclick={() => applyPreset(365)}>
			{m.analytics_preset_1y()}
		</button>
	</div>

	<!-- Date range inputs -->
	<div class="flex items-center gap-1">
		<input
			type="date"
			class="input input-bordered input-sm w-36"
			bind:value={dateFrom}
			onchange={applyDateRange}
		/>
		<span class="text-base-content/40">—</span>
		<input
			type="date"
			class="input input-bordered input-sm w-36"
			bind:value={dateTo}
			onchange={applyDateRange}
		/>
	</div>

	<!-- Granularity -->
	<FilterSelect
		options={GRANULARITY_OPTIONS}
		filterKey="granularity"
		currentValue={filters.granularity}
		placeholder={m.analytics_filter_granularity()}
		clearTooltip={m.analytics_filter_granularity()}
		onFilterChange={handleFilterChange}
	/>

	<!-- Activity kind -->
	<FilterSelect
		options={ACTIVITY_KIND_FILTER_OPTIONS}
		filterKey="activityKind"
		currentValue={filters.activityKind}
		placeholder={m.analytics_filter_activityKindPlaceholder()}
		clearTooltip={m.analytics_filter_activityKindClear()}
		onFilterChange={handleFilterChange}
	/>
</div>
