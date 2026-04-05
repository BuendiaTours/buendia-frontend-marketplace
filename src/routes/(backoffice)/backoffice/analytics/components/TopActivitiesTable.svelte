<script lang="ts">
	import * as m from '$paraglide/messages';
	import type { TopActivityItem } from '$core/analytics/types';

	type Props = {
		activities: TopActivityItem[];
	};

	let { activities }: Props = $props();

	function formatCurrency(cents: number): string {
		return new Intl.NumberFormat('es-ES', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 0
		}).format(cents / 100);
	}
</script>

<div class="card bg-base-100 border-base-content/10 border p-4">
	<h3 class="mb-3 text-sm font-semibold">{m.analytics_table_topActivities()}</h3>

	{#if activities.length > 0}
		<div class="overflow-x-auto">
			<table class="table-sm table">
				<thead>
					<tr>
						<th>{m.analytics_activity_title()}</th>
						<th>{m.analytics_activity_supplier()}</th>
						<th>{m.analytics_activity_kind()}</th>
						<th class="text-right">{m.analytics_activity_bookings()}</th>
						<th class="text-right">{m.analytics_activity_gmv()}</th>
						<th class="text-right">{m.analytics_activity_avgBookingValue()}</th>
						<th class="text-right">{m.analytics_activity_avgTravellers()}</th>
					</tr>
				</thead>
				<tbody>
					{#each activities as activity (activity.activityId)}
						<tr>
							<td class="max-w-48 truncate font-medium">{activity.activityTitle}</td>
							<td class="text-base-content/60 text-xs">{activity.supplierName}</td>
							<td>
								<span
									class="badge badge-sm"
									class:badge-primary={activity.activityKind === 'PAID_TOUR'}
									class:badge-secondary={activity.activityKind === 'FREE_TOUR'}
								>
									{activity.activityKind === 'PAID_TOUR' ? 'AP' : 'FT'}
								</span>
							</td>
							<td class="text-right">{activity.bookings}</td>
							<td class="text-right">{formatCurrency(activity.gmv)}</td>
							<td class="text-right">{formatCurrency(activity.avgBookingValue)}</td>
							<td class="text-right">{activity.avgTravellers.toFixed(1)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p class="text-base-content/40 py-6 text-center text-sm">{m.analytics_noData()}</p>
	{/if}
</div>
