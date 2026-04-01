<script lang="ts">
	/**
	 * Booking System tab — thin orchestrator that delegates to the
	 * appropriate booking system integration component (Bokun / TuriTop).
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import { getContext } from 'svelte';
	import { OptionIntegrationStatus, OptionBookingSystem } from '$core/activity-options/enums';
	import {
		OPTION_BOOKING_SYSTEM_OPTIONS,
		OPTION_INTEGRATION_STATUS_OPTIONS
	} from '$lib/labels/activityOptions';
	import BokunIntegration from '$lib/components/backoffice/booking-systems/adapters/bokun/BokunIntegration.svelte';
	import TuritopIntegration from '$lib/components/backoffice/booking-systems/adapters/turitop/TuritopIntegration.svelte';

	let { data }: PageProps = $props();

	const addToast =
		getContext<
			(toast: { data: { title: string; description: string; type: 'success' | 'error' } }) => void
		>('activityToast');

	const isEditable = $derived(
		data.option.integrationStatus === OptionIntegrationStatus.PENDING ||
			data.option.integrationStatus === OptionIntegrationStatus.UNNECESSARY
	);
	const isActivityIndexed = $derived(
		data.option.integrationStatus === OptionIntegrationStatus.ACTIVITY_INDEXED
	);
	const isCompleted = $derived(data.option.integrationStatus === OptionIntegrationStatus.COMPLETED);
	const isBokun = $derived(data.option.bookingSystem === OptionBookingSystem.BOKUN);
	const isTuritop = $derived(data.option.bookingSystem === OptionBookingSystem.TURITOP);

	const integrationStatusLabel = $derived(
		OPTION_INTEGRATION_STATUS_OPTIONS.find((o) => o.id === data.option.integrationStatus)?.name ??
			data.option.integrationStatus
	);
	const bookingSystemLabel = $derived(
		OPTION_BOOKING_SYSTEM_OPTIONS.find((o) => o.id === data.option.bookingSystem)?.name ??
			data.option.bookingSystem
	);

	function getStatusClass(status: string): string {
		switch (status) {
			case OptionIntegrationStatus.COMPLETED:
				return 'status-success';
			case OptionIntegrationStatus.ACTIVITY_INDEXED:
				return 'status-warning';
			case OptionIntegrationStatus.PENDING:
				return 'status-info';
			case OptionIntegrationStatus.UNNECESSARY:
				return 'status-neutral';
			default:
				return 'status-neutral';
		}
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<h3 class="text-lg font-semibold">{m.activities_bookingSystemSectionTitle()}</h3>
		<p class="text-base-content/60 text-sm">
			{isEditable
				? m.activities_integrationPendingDescription()
				: m.activities_integrationLinkedDescription()}
		</p>
	</div>

	<!-- Status + booking system -->
	<div class="grid max-w-2xl gap-4">
		<div class="flex items-center gap-3">
			<span class="text-sm font-medium">{m.activities_integrationStatusLabel()}:</span>
			<div
				aria-label="status"
				class="status status-lg {getStatusClass(data.option.integrationStatus)} mr-1"
			></div>
			<span class="text-sm">{integrationStatusLabel}</span>
		</div>

		<div>
			<span class="text-base-content/60 text-sm">{m.activities_bookingSystemLabel()}</span>
			<p class="font-medium">{bookingSystemLabel}</p>
		</div>

		<!-- Delegate to the appropriate integration component -->
		{#if isBokun}
			<BokunIntegration
				activity={data.activity}
				option={data.option}
				{isEditable}
				{isActivityIndexed}
				{isCompleted}
				bokunActivity={data.bokunActivity}
				pricingCategoryMappings={data.pricingCategoryMappings}
				{addToast}
			/>
		{:else if isTuritop}
			<TuritopIntegration
				activity={data.activity}
				option={data.option}
				{isEditable}
				{isActivityIndexed}
				{isCompleted}
				turitopProduct={data.turitopProduct}
				{addToast}
			/>
		{/if}
	</div>
</div>
