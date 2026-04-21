<script lang="ts">
	/**
	 * Bokun integration component — handles the full lifecycle:
	 * - PENDING: indexing form (code + priority)
	 * - ACTIVITY_INDEXED: rate mapping → pricing category mapping → finish
	 * - COMPLETED: read-only with unlink
	 */
	import * as m from '$paraglide/messages';
	import { invalidateAll } from '$app/navigation';
	import { ACTIVITY_REQUEST } from '$core/activities/requests';
	import { ACTIVITY_OPTION_REQUEST } from '$core/activity-options/requests';
	import { OptionIntegrationStatus } from '$core/activity-options/enums';
	import type { ActivityIndexationPriority } from '$core/activities/enums';
	import type { BookingSystem } from '$core/bookings/enums';
	import { BOKUN_REQUEST } from '$core/bokun/requests';
	import type {
		BokunActivity,
		BokunRate,
		BokunPricingCategory,
		BokunRawRate,
		BokunPricingCategoryMapping
	} from '$core/bokun/types';
	import { INDIVIDUAL_TICKET_GROUP_OPTIONS } from '$lib/labels/activityOptions';
	import { INDEXATION_PRIORITY_OPTIONS } from '$lib/labels/bookings';
	import PureHtmlDialog from '$lib/components/backoffice/PureHtmlDialog.svelte';

	type Props = {
		activity: { id: string; title: string };
		option: {
			id: string;
			title: string;
			bookingSystem: string;
			supplierOptionCode: string | null;
			ticketKind: string | null;
			individualTickets: Array<{ id: string; group: string }>;
			groupTickets: Array<{ id: string }>;
		};
		isEditable: boolean;
		isActivityIndexed: boolean;
		isCompleted: boolean;
		bokunActivity: BokunActivity | null;
		pricingCategoryMappings: BokunPricingCategoryMapping[];
		addToast: (t: {
			data: { title: string; description: string; type: 'success' | 'error' };
		}) => void;
	};

	let {
		activity,
		option,
		isEditable,
		isActivityIndexed,
		isCompleted,
		bokunActivity,
		pricingCategoryMappings,
		addToast
	}: Props = $props();

	const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
	function showToast(type: 'success' | 'error', title: string) {
		addToast({ data: { title, description: '', type } });
	}

	// ── Index state ─────────────────────────────
	// svelte-ignore state_referenced_locally
	let supplierOptionCode = $state(option.supplierOptionCode ?? '');
	let priority = $state<ActivityIndexationPriority | ''>('');
	let submitting = $state(false);

	// ── Rate mapping state ──────────────────────
	let selectedRateId = $state<number | ''>('');
	let mappingRate = $state(false);

	// ── Pricing category mapping state ──────────
	// svelte-ignore state_referenced_locally
	let pricingMappings = $state<Record<number, string>>(
		Object.fromEntries(
			(pricingCategoryMappings ?? [])
				.filter((m) => m.coreTicketId)
				.map((m) => [m.pricingCategoryId, m.coreTicketId as string])
		)
	);
	// svelte-ignore state_referenced_locally
	let mappedPricings = $state<Set<number>>(
		new Set(
			(pricingCategoryMappings ?? []).filter((m) => m.coreTicketId).map((m) => m.pricingCategoryId)
		)
	);
	let mappingPricing = $state<number | null>(null);

	// ── Finish / Unlink state ───────────────────
	let finishing = $state(false);
	let unlinking = $state(false);
	let unlinkDialog = $state<PureHtmlDialog>();

	// ── Derived ─────────────────────────────────
	const bokunRates = $derived<BokunRate[]>(bokunActivity?.rates ?? []);
	const bokunRawRates = $derived<BokunRawRate[]>(bokunActivity?.rawData?.rates ?? []);
	const allPricingCategories = $derived<BokunPricingCategory[]>(
		bokunActivity?.rawData?.pricingCategories ?? []
	);
	const currentRate = $derived(bokunRates.find((r) => r.coreOptionId === option.id));

	const ratePricingCategories = $derived.by(() => {
		if (!currentRate) return [];
		const rawRate = bokunRawRates.find((r) => r.id === currentRate.id);
		if (!rawRate) return allPricingCategories;
		const ids = new Set(rawRate.pricingCategoryIds);
		return allPricingCategories.filter((pc) => ids.has(pc.id));
	});

	const tickets = $derived(
		option.ticketKind === 'INDIVIDUAL'
			? (option.individualTickets ?? [])
			: (option.groupTickets ?? [])
	);

	const canSubmitIndex = $derived(
		supplierOptionCode.trim() !== '' && priority !== '' && !submitting
	);

	const usedTicketIds = $derived(new Set(Object.values(pricingMappings).filter(Boolean)));

	const canFinish = $derived(
		currentRate !== undefined &&
			tickets.length > 0 &&
			tickets.every((t) => usedTicketIds.has(t.id)) &&
			!finishing
	);

	// ── Handlers ────────────────────────────────
	async function handleIndex() {
		if (!canSubmitIndex) return;
		submitting = true;
		try {
			await ACTIVITY_REQUEST.indexActivity(fetch, {
				coreId: activity.id,
				bookingSystem: option.bookingSystem as unknown as BookingSystem,
				bookingSystemId: supplierOptionCode.trim(),
				coreTitle: `${activity.title} - ${option.title}`,
				priority: priority as ActivityIndexationPriority
			});
			await delay(500);
			await ACTIVITY_OPTION_REQUEST.update(fetch, option.id, {
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
			await BOKUN_REQUEST.mapRate(fetch, selectedRateId as number, { coreId: option.id });
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
		if (!ticketId || !currentRate || !bokunActivity) return;
		mappingPricing = pricingCategoryId;
		try {
			await BOKUN_REQUEST.mapPricingCategory(fetch, pricingCategoryId, {
				coreId: ticketId,
				activityId: bokunActivity.id,
				rateId: currentRate.id,
				ticketScope: option.ticketKind === 'GROUP' ? 'GROUP' : 'INDIVIDUAL'
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
			await BOKUN_REQUEST.finishMapping(fetch, activity.id);
			await delay(500);
			await ACTIVITY_OPTION_REQUEST.update(fetch, option.id, {
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
			// Happy path: there's a Bokun rate linked to this option.
			// Detach the rate so the mapping is cleared in Bokun; the reset event
			// back to core will transition the option out of ACTIVITY_INDEXED.
			if (currentRate) {
				await BOKUN_REQUEST.mapRate(fetch, currentRate.id, { coreId: null });
				await delay(500);
			} else {
				// Out-of-sync path: core thinks the option is indexed but Bokun has
				// no record. Ask integrations-app to reset the mapping anyway so it
				// can emit the event that transitions core back to PENDING.
				try {
					await BOKUN_REQUEST.resetMapping(fetch, activity.id);
					await delay(500);
				} catch {
					// integrations-app may 404 if the core-activity never reached it;
					// proceed to clear the supplierOptionCode below regardless.
				}
			}
			await ACTIVITY_OPTION_REQUEST.update(fetch, option.id, { supplierOptionCode: null });
			unlinkDialog?.close();
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

<!-- ═══ STEP 1: Index ═══ -->
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
			{#each INDEXATION_PRIORITY_OPTIONS as opt (opt.id)}
				<option value={opt.id}>{opt.name}</option>
			{/each}
		</select>
	</div>
	<div class="mt-2">
		<button type="button" class="btn btn-primary" disabled={!canSubmitIndex} onclick={handleIndex}>
			{#if submitting}<span class="loading loading-spinner loading-sm"></span>{/if}
			{m.activities_bookingSystemSubmitButton()}
		</button>
	</div>
{/if}

<!-- ═══ Data not available ═══ -->
{#if (isActivityIndexed || isCompleted) && !bokunActivity}
	<div>
		<span class="text-base-content/60 text-sm">{m.activities_supplierOptionCodeLabel()}</span>
		<p class="font-medium">{option.supplierOptionCode ?? '—'}</p>
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

<!-- ═══ STEP 2-3: Mapping ═══ -->
{#if (isActivityIndexed || isCompleted) && bokunActivity}
	<div>
		<span class="text-base-content/60 text-sm">{m.activities_supplierOptionCodeLabel()}</span>
		<p class="font-medium">{option.supplierOptionCode ?? '—'}</p>
	</div>

	<div class="divider"></div>

	<!-- Rate mapping -->
	<div>
		<h4 class="text-md font-semibold">{m.activities_integrationRateSectionTitle()}</h4>
		<p class="text-base-content/60 text-sm">{m.activities_integrationRateSectionDescription()}</p>
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
				<label class="label text-sm" for="rateSelect"
					><span>{m.activities_integrationRateLabel()}</span></label
				>
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
				{#if mappingRate}<span class="loading loading-spinner loading-xs"></span>{/if}
				{m.activities_integrationRateButton()}
			</button>
		</div>
	{/if}

	<!-- Pricing category mapping -->
	{#if currentRate}
		<div class="divider"></div>
		<div>
			<h4 class="text-md font-semibold">{m.activities_integrationPricingTitle()}</h4>
			<p class="text-base-content/60 text-sm">{m.activities_integrationPricingDescription()}</p>
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
							{#if pc.minAge || pc.maxAge}· Edad: {pc.minAge} - {pc.maxAge}{/if}
						</p>
					</div>
					{#if mappedPricings.has(pc.id)}<span class="badge badge-success">Vinculado</span>{/if}
					<select
						class="select select-bordered select-sm w-48"
						value={pricingMappings[pc.id] ?? ''}
						onchange={(e) => (pricingMappings[pc.id] = e.currentTarget.value)}
						disabled={mappingPricing === pc.id || mappedPricings.has(pc.id) || isCompleted}
					>
						<option value="" disabled>{m.activities_integrationPricingPlaceholder()}</option>
						{#each tickets as ticket (ticket.id)}
							<option
								value={ticket.id}
								disabled={usedTicketIds.has(ticket.id) && pricingMappings[pc.id] !== ticket.id}
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
						{#if mappingPricing === pc.id}<span class="loading loading-spinner loading-xs"
							></span>{/if}
						{m.activities_integrationPricingButton()}
					</button>
				</div>
			{/each}
		</div>

		<div class="mt-4 flex gap-3">
			{#if !isCompleted}
				<button type="button" class="btn btn-success" disabled={!canFinish} onclick={handleFinish}>
					{#if finishing}<span class="loading loading-spinner loading-sm"></span>{/if}
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

<!-- Unlink dialog -->
<PureHtmlDialog bind:this={unlinkDialog} title={m.activities_bookingSystemUnlinkDialogTitle()}>
	{#snippet content()}<p>{m.activities_bookingSystemUnlinkDialogMessage()}</p>{/snippet}
	{#snippet actions()}
		<button class="btn" onclick={() => unlinkDialog?.close()}>{m.common_cancel()}</button>
		<button class="btn btn-error" disabled={unlinking} onclick={handleUnlink}>
			{#if unlinking}<span class="loading loading-spinner loading-sm"></span>{/if}
			{m.activities_bookingSystemUnlinkButton()}
		</button>
	{/snippet}
</PureHtmlDialog>
