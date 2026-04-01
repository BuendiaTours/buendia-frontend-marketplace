<script lang="ts">
	/**
	 * Booking System tab — full integration flow:
	 * 1. PENDING/UNNECESSARY: form to index (code + priority)
	 * 2. ACTIVITY_INDEXED (Bokun): map rate → map pricing categories → finish
	 * 3. COMPLETED: read-only summary with unlink
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import { getContext } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { ACTIVITY_REQUEST } from '$core/activities/requests';
	import { ACTIVITY_OPTION_REQUEST } from '$core/activity-options/requests';
	import { OptionIntegrationStatus, OptionBookingSystem } from '$core/activity-options/enums';
	import type { ActivityIndexationPriority } from '$core/activities/enums';
	import type { BookingSystem } from '$core/bookings/enums';
	import { BOKUN_REQUEST } from '$core/bokun/requests';
	import type { BokunRate, BokunPricingCategory, BokunRawRate } from '$core/bokun/types';
	import {
		OPTION_BOOKING_SYSTEM_OPTIONS,
		OPTION_INTEGRATION_STATUS_OPTIONS,
		INDIVIDUAL_TICKET_GROUP_OPTIONS
	} from '$lib/labels/activityOptions';
	import { INDEXATION_PRIORITY_OPTIONS } from '$lib/labels/bookings';
	import PureHtmlDialog from '$lib/components/backoffice/PureHtmlDialog.svelte';

	let { data }: PageProps = $props();

	const addToast =
		getContext<
			(toast: { data: { title: string; description: string; type: 'success' | 'error' } }) => void
		>('activityToast');

	// svelte-ignore state_referenced_locally
	let supplierOptionCode = $state(data.option.supplierOptionCode ?? '');
	let priority = $state<ActivityIndexationPriority | ''>('');
	let submitting = $state(false);
	let unlinking = $state(false);
	let unlinkDialog = $state<PureHtmlDialog>();

	// ── Rate mapping state ──────────────────────
	let selectedRateId = $state<number | ''>('');
	let mappingRate = $state(false);

	// ── Pricing category mapping state (initialized from server data) ──
	// svelte-ignore state_referenced_locally
	let pricingMappings = $state<Record<number, string>>(
		Object.fromEntries(
			(data.pricingCategoryMappings ?? [])
				.filter((m) => m.coreTicketId)
				.map((m) => [m.pricingCategoryId, m.coreTicketId as string])
		)
	);
	// svelte-ignore state_referenced_locally
	let mappedPricings = $state<Set<number>>(
		new Set(
			(data.pricingCategoryMappings ?? [])
				.filter((m) => m.coreTicketId)
				.map((m) => m.pricingCategoryId)
		)
	);
	let mappingPricing = $state<number | null>(null);

	// ── Finish state ────────────────────────────
	let finishing = $state(false);

	// ── Derived ─────────────────────────────────
	const isEditable = $derived(
		data.option.integrationStatus === OptionIntegrationStatus.PENDING ||
			data.option.integrationStatus === OptionIntegrationStatus.UNNECESSARY
	);

	const isActivityIndexed = $derived(
		data.option.integrationStatus === OptionIntegrationStatus.ACTIVITY_INDEXED
	);

	const isCompleted = $derived(data.option.integrationStatus === OptionIntegrationStatus.COMPLETED);

	const isBokun = $derived(data.option.bookingSystem === OptionBookingSystem.BOKUN);

	const integrationStatusLabel = $derived(
		OPTION_INTEGRATION_STATUS_OPTIONS.find((o) => o.id === data.option.integrationStatus)?.name ??
			data.option.integrationStatus
	);

	const bookingSystemLabel = $derived(
		OPTION_BOOKING_SYSTEM_OPTIONS.find((o) => o.id === data.option.bookingSystem)?.name ??
			data.option.bookingSystem
	);

	const bokunRates = $derived<BokunRate[]>(data.bokunActivity?.rates ?? []);
	const bokunRawRates = $derived<BokunRawRate[]>(data.bokunActivity?.rawData?.rates ?? []);
	const allPricingCategories = $derived<BokunPricingCategory[]>(
		data.bokunActivity?.rawData?.pricingCategories ?? []
	);

	const currentRate = $derived(bokunRates.find((r) => r.coreOptionId === data.option.id));

	/** Pricing categories that belong to the current rate (filtered by pricingCategoryIds). */
	const ratePricingCategories = $derived.by(() => {
		if (!currentRate) return [];
		const rawRate = bokunRawRates.find((r) => r.id === currentRate.id);
		if (!rawRate) return allPricingCategories;
		const ids = new Set(rawRate.pricingCategoryIds);
		return allPricingCategories.filter((pc) => ids.has(pc.id));
	});

	const tickets = $derived(
		data.option.ticketKind === 'INDIVIDUAL'
			? (data.option.individualTickets ?? [])
			: (data.option.groupTickets ?? [])
	);

	const canFinish = $derived(
		currentRate !== undefined &&
			ratePricingCategories.length > 0 &&
			ratePricingCategories.every((pc) => mappedPricings.has(pc.id)) &&
			!finishing
	);

	function getStatusClass(status: OptionIntegrationStatus): string {
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

	const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

	function showToast(type: 'success' | 'error', title: string) {
		addToast({ data: { title, description: '', type } });
	}

	// ── Handlers ────────────────────────────────

	const canSubmitIndex = $derived(
		supplierOptionCode.trim() !== '' && priority !== '' && !submitting
	);

	async function handleIndex() {
		if (!canSubmitIndex) return;
		submitting = true;
		try {
			await ACTIVITY_REQUEST.indexActivity(fetch, {
				coreId: data.activity.id,
				bookingSystem: data.option.bookingSystem as unknown as BookingSystem,
				bookingSystemId: supplierOptionCode.trim(),
				coreTitle: `${data.activity.title} - ${data.option.title}`,
				priority: priority as ActivityIndexationPriority
			});
			await delay(500);
			await ACTIVITY_OPTION_REQUEST.update(fetch, data.option.id, {
				supplierOptionCode: supplierOptionCode.trim()
			});
			showToast('success', m.activities_integrationSaveSuccess());
			await delay(500);
			await invalidateAll();
		} catch {
			showToast('error', m.activities_integrationSaveError());
		} finally {
			submitting = false;
		}
	}

	async function handleMapRate() {
		if (!selectedRateId || mappingRate) return;
		mappingRate = true;
		try {
			await BOKUN_REQUEST.mapRate(fetch, selectedRateId as number, {
				coreId: data.option.id
			});
			showToast('success', m.activities_integrationRateSuccess());
			await delay(500);
			await invalidateAll();
		} catch {
			showToast('error', m.activities_integrationRateError());
		} finally {
			mappingRate = false;
		}
	}

	async function handleMapPricingCategory(pricingCategoryId: number) {
		const ticketId = pricingMappings[pricingCategoryId];
		if (!ticketId || !currentRate || !data.bokunActivity) return;
		mappingPricing = pricingCategoryId;
		try {
			await BOKUN_REQUEST.mapPricingCategory(fetch, pricingCategoryId, {
				coreId: ticketId,
				activityId: data.bokunActivity.id,
				rateId: currentRate.id,
				ticketScope: data.option.ticketKind === 'GROUP' ? 'GROUP' : 'INDIVIDUAL'
			});
			mappedPricings = new Set([...mappedPricings, pricingCategoryId]);
			showToast('success', m.activities_integrationPricingSuccess());
		} catch {
			showToast('error', m.activities_integrationPricingError());
		} finally {
			mappingPricing = null;
		}
	}

	async function handleFinish() {
		if (!canFinish) return;
		finishing = true;
		try {
			await BOKUN_REQUEST.finishMapping(fetch, data.activity.id);
			await delay(500);
			await ACTIVITY_OPTION_REQUEST.update(fetch, data.option.id, {
				integrationStatus: OptionIntegrationStatus.COMPLETED
			});
			showToast('success', m.activities_integrationFinishSuccess());
			await delay(500);
			await invalidateAll();
		} catch {
			showToast('error', m.activities_integrationFinishError());
		} finally {
			finishing = false;
		}
	}

	async function handleUnlink() {
		unlinking = true;
		try {
			await BOKUN_REQUEST.resetMapping(fetch, data.activity.id);
			await delay(500);
			await ACTIVITY_OPTION_REQUEST.update(fetch, data.option.id, {
				supplierOptionCode: null
			});
			unlinkDialog?.close();

			// Reset all local state
			supplierOptionCode = '';
			priority = '';
			selectedRateId = '';
			pricingMappings = {};
			mappedPricings = new Set();

			showToast('success', m.activities_bookingSystemUnlinkSuccess());
			await delay(500);
			await invalidateAll();
		} catch {
			showToast('error', m.activities_bookingSystemUnlinkError());
		} finally {
			unlinking = false;
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

	<!-- Status + booking system (always visible) -->
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

		<!-- ═══ STEP 1: Index (PENDING / UNNECESSARY) ═══ -->
		{#if isEditable}
			<div class="form-control w-full max-w-lg">
				<label class="label" for="supplierOptionCode">
					<span class="label-text">{m.activities_supplierOptionCodeLabel()}</span>
				</label>
				<input
					id="supplierOptionCode"
					type="text"
					class="input input-bordered w-full"
					placeholder={m.activities_supplierOptionCodePlaceholder()}
					bind:value={supplierOptionCode}
					disabled={submitting}
				/>
			</div>

			<div class="form-control w-full max-w-lg">
				<label class="label" for="priority">
					<span class="label-text">{m.activities_bookingSystemPriorityLabel()}</span>
				</label>
				<select
					id="priority"
					class="select select-bordered w-full"
					bind:value={priority}
					disabled={submitting}
				>
					<option value="" disabled>{m.activities_bookingSystemPriorityPlaceholder()}</option>
					{#each INDEXATION_PRIORITY_OPTIONS as option (option.id)}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
			</div>

			<div class="mt-2">
				<button
					type="button"
					class="btn btn-primary"
					disabled={!canSubmitIndex}
					onclick={handleIndex}
				>
					{#if submitting}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					{m.activities_bookingSystemSubmitButton()}
				</button>
			</div>
		{/if}

		<!-- ═══ Bokun: data not available ═══ -->
		{#if (isActivityIndexed || isCompleted) && isBokun && !data.bokunActivity}
			<div>
				<span class="text-base-content/60 text-sm">{m.activities_supplierOptionCodeLabel()}</span>
				<p class="font-medium">{data.option.supplierOptionCode ?? '—'}</p>
			</div>
			<div class="bg-warning/10 border-warning rounded-lg border-l-4 px-4 py-3">
				<p class="text-sm">{m.activities_integrationLoadError()}</p>
			</div>
			<div class="mt-2">
				<button
					type="button"
					class="btn btn-error btn-outline"
					onclick={() => unlinkDialog?.showModal()}
				>
					{m.activities_bookingSystemUnlinkButton()}
				</button>
			</div>
		{/if}

		<!-- ═══ STEP 2-3: Bokun mapping (ACTIVITY_INDEXED / COMPLETED) ═══ -->
		{#if (isActivityIndexed || isCompleted) && isBokun && data.bokunActivity}
			<div>
				<span class="text-base-content/60 text-sm">{m.activities_supplierOptionCodeLabel()}</span>
				<p class="font-medium">{data.option.supplierOptionCode ?? '—'}</p>
			</div>

			<div class="divider"></div>

			<!-- Rate mapping -->
			<div>
				<h4 class="text-md font-semibold">{m.activities_integrationRateSectionTitle()}</h4>
				<p class="text-base-content/60 text-sm">
					{m.activities_integrationRateSectionDescription()}
				</p>
			</div>

			{#if currentRate}
				<div
					class="bg-success/10 border-success flex items-center gap-3 rounded-lg border-l-4 px-4 py-3"
				>
					<span class="text-sm font-medium">{m.activities_integrationRateLinked()}:</span>
					<span class="text-sm">{currentRate.rateTitle} (ID: {currentRate.id})</span>
				</div>
			{:else}
				<div class="flex max-w-lg items-end gap-2">
					<div class="flex-1">
						<label class="label text-sm" for="rateSelect">
							<span>{m.activities_integrationRateLabel()}</span>
						</label>
						<select
							id="rateSelect"
							class="select select-bordered w-full"
							bind:value={selectedRateId}
							disabled={mappingRate || isCompleted}
						>
							<option value="" disabled>{m.activities_integrationRatePlaceholder()}</option>
							{#each bokunRates.filter((r) => !r.coreOptionId) as rate (rate.id)}
								<option value={rate.id}>{rate.rateTitle} (ID: {rate.id})</option>
							{/each}
						</select>
					</div>
					<button
						type="button"
						class="btn btn-primary btn-sm h-[42px]"
						disabled={!selectedRateId || mappingRate}
						onclick={handleMapRate}
					>
						{#if mappingRate}
							<span class="loading loading-spinner loading-xs"></span>
						{/if}
						{m.activities_integrationRateButton()}
					</button>
				</div>
			{/if}

			<!-- Pricing category mapping (only after rate is mapped) -->
			{#if currentRate}
				<div class="divider"></div>

				<div>
					<h4 class="text-md font-semibold">{m.activities_integrationPricingTitle()}</h4>
					<p class="text-base-content/60 text-sm">
						{m.activities_integrationPricingDescription()}
					</p>
				</div>

				<div class="space-y-3">
					{#each ratePricingCategories as pc (pc.id)}
						<div
							class="border-base-300 bg-base-200/50 flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3"
						>
							<div class="min-w-0 flex-1">
								<p class="font-medium">{pc.title}</p>
								<p class="text-base-content/50 text-xs">
									{pc.ticketCategory}
									{#if pc.minAge || pc.maxAge}
										· Edad: {pc.minAge} - {pc.maxAge}
									{/if}
								</p>
							</div>

							{#if mappedPricings.has(pc.id)}
								<span class="badge badge-success">Vinculado</span>
							{/if}

							<select
								class="select select-bordered select-sm w-48"
								value={pricingMappings[pc.id] ?? ''}
								onchange={(e) => (pricingMappings[pc.id] = e.currentTarget.value)}
								disabled={mappingPricing === pc.id || mappedPricings.has(pc.id) || isCompleted}
							>
								<option value="" disabled>{m.activities_integrationPricingPlaceholder()}</option>
								{#each tickets as ticket (ticket.id)}
									<option value={ticket.id}
										>{#if 'group' in ticket}{INDIVIDUAL_TICKET_GROUP_OPTIONS.find(
												(o) => o.id === ticket.group
											)?.name ?? ticket.group}{:else}{ticket.id.slice(0, 8)}{/if}</option
									>
								{/each}
							</select>
							<button
								type="button"
								class="btn btn-outline btn-primary btn-sm"
								disabled={!pricingMappings[pc.id] ||
									mappingPricing === pc.id ||
									mappedPricings.has(pc.id) ||
									isCompleted}
								onclick={() => handleMapPricingCategory(pc.id)}
							>
								{#if mappingPricing === pc.id}
									<span class="loading loading-spinner loading-xs"></span>
								{/if}
								{m.activities_integrationPricingButton()}
							</button>
						</div>
					{/each}
				</div>

				<!-- Action buttons -->
				<div class="mt-4 flex gap-3">
					{#if !isCompleted}
						<button
							type="button"
							class="btn btn-success"
							disabled={!canFinish}
							onclick={handleFinish}
						>
							{#if finishing}
								<span class="loading loading-spinner loading-sm"></span>
							{/if}
							{m.activities_integrationFinishButton()}
						</button>
					{/if}
					<button
						type="button"
						class="btn btn-error btn-outline"
						onclick={() => unlinkDialog?.showModal()}
					>
						{m.activities_bookingSystemUnlinkButton()}
					</button>
				</div>
			{/if}
		{/if}

		<!-- ═══ Non-Bokun read-only ═══ -->
		{#if (isCompleted || isActivityIndexed) && !isBokun}
			<div>
				<span class="text-base-content/60 text-sm">{m.activities_supplierOptionCodeLabel()}</span>
				<p class="font-medium">{data.option.supplierOptionCode ?? '—'}</p>
			</div>

			<div class="mt-2">
				<button
					type="button"
					class="btn btn-error btn-outline"
					onclick={() => unlinkDialog?.showModal()}
				>
					{m.activities_bookingSystemUnlinkButton()}
				</button>
			</div>
		{/if}
	</div>

	<!-- Unlink dialog (shared) -->
	<PureHtmlDialog bind:this={unlinkDialog} title={m.activities_bookingSystemUnlinkDialogTitle()}>
		{#snippet content()}
			<p>{m.activities_bookingSystemUnlinkDialogMessage()}</p>
		{/snippet}
		{#snippet actions()}
			<button class="btn" onclick={() => unlinkDialog?.close()}>
				{m.common_cancel()}
			</button>
			<button class="btn btn-error" disabled={unlinking} onclick={handleUnlink}>
				{#if unlinking}
					<span class="loading loading-spinner loading-sm"></span>
				{/if}
				{m.activities_bookingSystemUnlinkButton()}
			</button>
		{/snippet}
	</PureHtmlDialog>
</div>
