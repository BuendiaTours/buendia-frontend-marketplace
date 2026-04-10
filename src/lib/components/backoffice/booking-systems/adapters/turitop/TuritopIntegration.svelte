<script lang="ts">
	/**
	 * TuriTop integration component — handles the full lifecycle:
	 * - PENDING: indexing form (code + priority + tenant)
	 * - ACTIVITY_INDEXED: ticket mapping → finish (product auto-mapped on index)
	 * - COMPLETED: read-only with unlink
	 */
	import * as m from '$paraglide/messages';
	import { invalidateAll } from '$app/navigation';
	import { ACTIVITY_REQUEST } from '$core/activities/requests';
	import { ACTIVITY_OPTION_REQUEST } from '$core/activity-options/requests';
	import { OptionIntegrationStatus } from '$core/activity-options/enums';
	import type { ActivityIndexationPriority } from '$core/activities/enums';
	import type { BookingSystem } from '$core/bookings/enums';
	import { TURITOP_REQUEST } from '$core/turitop/requests';
	import type { TuritopProduct, TuritopTicket } from '$core/turitop/types';
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
		turitopProduct: TuritopProduct | null;
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
		turitopProduct,
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
	let tenant = $state('');
	let submitting = $state(false);

	// ── Ticket mapping state ────────────────────
	const turitopTickets = $derived<TuritopTicket[]>(turitopProduct?.tickets ?? []);

	// svelte-ignore state_referenced_locally
	let ticketMappings = $state<Record<string, string>>(
		Object.fromEntries(
			turitopTickets
				.filter((t) => t.coreTicketId)
				.map((t) => [t.turitopId, t.coreTicketId as string])
		)
	);
	// svelte-ignore state_referenced_locally
	let mappedTickets = $state<Set<string>>(
		new Set(turitopTickets.filter((t) => t.coreTicketId).map((t) => t.turitopId))
	);
	let mappingTicket = $state<string | null>(null);

	// ── Finish / Unlink state ───────────────────
	let finishing = $state(false);
	let unlinking = $state(false);
	let unlinkDialog = $state<PureHtmlDialog>();

	// ── Derived ─────────────────────────────────
	const tickets = $derived(
		option.ticketKind === 'INDIVIDUAL'
			? (option.individualTickets ?? [])
			: (option.groupTickets ?? [])
	);

	const canSubmitIndex = $derived(
		supplierOptionCode.trim() !== '' && priority !== '' && tenant.trim() !== '' && !submitting
	);

	const usedTicketIds = $derived(new Set(Object.values(ticketMappings).filter(Boolean)));

	const canFinish = $derived(
		turitopTickets.filter((t) => !t.isAddon).length > 0 &&
			turitopTickets.filter((t) => !t.isAddon).every((t) => mappedTickets.has(t.turitopId)) &&
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
				priority: priority as ActivityIndexationPriority,
				tenant: tenant.trim()
			});
			await delay(500);
			await ACTIVITY_OPTION_REQUEST.update(fetch, option.id, {
				supplierOptionCode: supplierOptionCode.trim()
			});
			await delay(500);
			await TURITOP_REQUEST.mapProduct(fetch, supplierOptionCode.trim(), {
				coreId: option.id,
				tenant: tenant.trim()
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

	async function handleMapTicket(turitopId: string) {
		const ticketId = ticketMappings[turitopId];
		if (!ticketId) return;
		mappingTicket = turitopId;
		try {
			await TURITOP_REQUEST.mapTicket(fetch, turitopId, {
				coreId: ticketId,
				ticketScope: option.ticketKind === 'GROUP' ? 'GROUP' : 'INDIVIDUAL'
			});
			mappedTickets = new Set([...mappedTickets, turitopId]);
			showToast('success', m.activities_integrationPricingSuccess());
		} catch {
			showToast('error', m.activities_integrationPricingError());
		} finally {
			mappingTicket = null;
		}
	}

	async function handleFinish() {
		if (!canFinish) return;
		finishing = true;
		try {
			await TURITOP_REQUEST.finishMapping(fetch, activity.id);
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
		if (!turitopProduct) return;
		unlinking = true;
		try {
			await TURITOP_REQUEST.resetMapping(fetch, activity.id, {
				bookingSystem: 'TURITOP',
				bookingSystemId: turitopProduct.shortId,
				tenant: turitopProduct.tenant
			});
			await delay(500);
			await ACTIVITY_OPTION_REQUEST.update(fetch, option.id, { supplierOptionCode: null });
			unlinkDialog?.close();
			supplierOptionCode = '';
			priority = '';
			tenant = '';
			ticketMappings = {};
			mappedTickets = new Set();
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
	<div class="form-control w-full max-w-lg">
		<label class="label" for="tenant">
			<span class="label-text">{m.activities_integrationTenantLabel()}</span>
		</label>
		<input
			id="tenant"
			type="text"
			class="input input-bordered w-full"
			placeholder={m.activities_integrationTenantPlaceholder()}
			bind:value={tenant}
			disabled={submitting}
		/>
	</div>
	<div class="mt-2">
		<button type="button" class="btn btn-primary" disabled={!canSubmitIndex} onclick={handleIndex}>
			{#if submitting}<span class="loading loading-spinner loading-sm"></span>{/if}
			{m.activities_bookingSystemSubmitButton()}
		</button>
	</div>
{/if}

<!-- ═══ Data not available ═══ -->
{#if (isActivityIndexed || isCompleted) && !turitopProduct}
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

<!-- ═══ STEP 2: Ticket mapping ═══ -->
{#if (isActivityIndexed || isCompleted) && turitopProduct}
	<div>
		<span class="text-base-content/60 text-sm">{m.activities_supplierOptionCodeLabel()}</span>
		<p class="font-medium">{option.supplierOptionCode ?? '—'}</p>
	</div>

	<div class="bg-success/10 border-success flex items-center gap-3 rounded-lg border-l-4 px-4 py-3">
		<span class="text-sm">{m.activities_integrationProductMapped()}</span>
	</div>

	<div class="divider"></div>

	<div>
		<h4 class="text-md font-semibold">{m.activities_integrationPricingTitle()}</h4>
		<p class="text-base-content/60 text-sm">{m.activities_integrationPricingDescription()}</p>
	</div>

	<div class="space-y-3">
		{#each turitopTickets.filter((t) => !t.isAddon) as tt (tt.turitopId)}
			<div
				class="border-base-300 bg-base-200/50 flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3"
			>
				<div class="min-w-0 flex-1">
					<p class="font-medium">{tt.name}</p>
					<p class="text-base-content/50 text-xs">{tt.price} {tt.currency} · {tt.ticketScope}</p>
				</div>
				{#if mappedTickets.has(tt.turitopId)}<span class="badge badge-success">Vinculado</span>{/if}
				<select
					class="select select-bordered select-sm w-48"
					value={ticketMappings[tt.turitopId] ?? ''}
					onchange={(e) => (ticketMappings[tt.turitopId] = e.currentTarget.value)}
					disabled={mappingTicket === tt.turitopId ||
						mappedTickets.has(tt.turitopId) ||
						isCompleted}
				>
					<option value="" disabled>{m.activities_integrationPricingPlaceholder()}</option>
					{#each tickets as ticket (ticket.id)}
						<option
							value={ticket.id}
							disabled={usedTicketIds.has(ticket.id) && ticketMappings[tt.turitopId] !== ticket.id}
							>{#if 'group' in ticket}{INDIVIDUAL_TICKET_GROUP_OPTIONS.find(
									(o) => o.id === ticket.group
								)?.name ?? ticket.group}{:else}{ticket.id.slice(0, 8)}{/if}</option
						>
					{/each}
				</select>
				<button
					type="button"
					class="btn btn-outline btn-primary btn-sm"
					disabled={!ticketMappings[tt.turitopId] ||
						mappingTicket === tt.turitopId ||
						mappedTickets.has(tt.turitopId) ||
						isCompleted}
					onclick={() => handleMapTicket(tt.turitopId)}
				>
					{#if mappingTicket === tt.turitopId}<span class="loading loading-spinner loading-xs"
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
