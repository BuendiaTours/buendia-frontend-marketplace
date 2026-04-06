<script lang="ts">
	/**
	 * Tickets tab — manages individual and group tickets for an activity option.
	 * Read-only cards for existing tickets + dialog for creation.
	 * Age/persons min is auto-calculated and locked.
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import type { IndividualTicket, GroupTicket } from '$core/activity-options/types';
	import { getContext } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import { OptionTicketKind } from '$core/activity-options/enums';
	import {
		IndividualTicketStatus,
		IndividualTicketGroup,
		IndividualTicketFree,
		IndividualTicketNeeded,
		GroupTicketStatus
	} from '$core/activity-options/enums';
	import { ACTIVITY_OPTION_REQUEST } from '$core/activity-options/requests';
	import { CommissionKind } from '$core/suppliers/enums';
	import { COMMISSION_KIND_OPTIONS } from '$lib/labels/suppliers';

	type CommissionSelection = 'SUPPLIER' | CommissionKind;

	const TICKET_COMMISSION_OPTIONS: Array<{ id: CommissionSelection; name: string }> = [
		{ id: 'SUPPLIER', name: m.activities_optionTicketCommissionKindSupplier() },
		...COMMISSION_KIND_OPTIONS
	];
	import {
		INDIVIDUAL_TICKET_STATUS_OPTIONS,
		INDIVIDUAL_TICKET_GROUP_OPTIONS,
		INDIVIDUAL_TICKET_FREE_OPTIONS,
		INDIVIDUAL_TICKET_NEEDED_OPTIONS,
		GROUP_TICKET_STATUS_OPTIONS,
		OPTION_TICKET_KIND_OPTIONS
	} from '$lib/labels/activityOptions';
	import { showConfirmDialog } from '$lib/actions/backoffice/confirmAction';
	import { Ticket, Add } from '$lib/icons/Linear';
	import PureHtmlDialog from '$lib/components/backoffice/PureHtmlDialog.svelte';

	let { data }: PageProps = $props();

	const addToast =
		getContext<
			(toast: { data: { title: string; description: string; type: 'success' | 'error' } }) => void
		>('activityToast');
	const updateTicketCount = getContext<(count: number) => void>('updateTicketCount');

	// svelte-ignore state_referenced_locally
	let ticketKind = $state<OptionTicketKind | null>(data.option.ticketKind);
	const isIndividual = $derived(ticketKind === OptionTicketKind.INDIVIDUAL);
	const isGroup = $derived(ticketKind === OptionTicketKind.GROUP);

	// svelte-ignore state_referenced_locally
	let individualTickets: IndividualTicket[] = $state(data.option.individualTickets ?? []);
	// svelte-ignore state_referenced_locally
	let groupTickets: GroupTicket[] = $state(data.option.groupTickets ?? []);

	let isAdding = $state(false);
	let isRemoving = $state<string | null>(null);

	$effect(() => {
		if (isIndividual) {
			updateTicketCount(individualTickets.length);
		} else if (isGroup) {
			updateTicketCount(groupTickets.length);
		} else {
			updateTicketCount(0);
		}
	});

	function showToast(type: 'success' | 'error', description: string) {
		addToast?.({ data: { title: type === 'success' ? 'Success' : 'Error', description, type } });
	}

	function formatPrice(cents: number): string {
		return (cents / 100).toFixed(2) + ' €';
	}

	// ── Ticket kind management ──

	let selectedKind = $state<OptionTicketKind | ''>('');
	let settingKind = $state(false);
	let changeKindDialog = $state<PureHtmlDialog>();
	let pendingKindChange = $state<OptionTicketKind | null>(null);

	async function handleSetTicketKind() {
		if (!selectedKind || settingKind) return;
		settingKind = true;
		try {
			await ACTIVITY_OPTION_REQUEST.update(fetch, data.option.id, {
				ticketKind: selectedKind as OptionTicketKind
			});
			ticketKind = selectedKind as OptionTicketKind;
		} catch {
			showToast('error', m.activities_optionTicketError());
		} finally {
			settingKind = false;
		}
	}

	function requestKindChange(newKind: OptionTicketKind) {
		pendingKindChange = newKind;
		changeKindDialog?.showModal();
	}

	async function confirmKindChange() {
		if (!pendingKindChange || settingKind) return;
		settingKind = true;
		try {
			await ACTIVITY_OPTION_REQUEST.update(fetch, data.option.id, {
				ticketKind: pendingKindChange
			});
			ticketKind = pendingKindChange;
			changeKindDialog?.close();
		} catch {
			showToast('error', m.activities_optionTicketError());
		} finally {
			settingKind = false;
			pendingKindChange = null;
		}
	}

	// ── Auto-calculated min values ──

	/**
	 * Find the best available age gap among existing tickets.
	 * Returns { min, max } for the first gap found:
	 * 1. Before the first ticket (if it doesn't start at 0)
	 * 2. Between two tickets
	 * 3. After the last ticket
	 */
	function suggestAgeRange(): { min: number; max: number } {
		if (individualTickets.length === 0) return { min: 0, max: 99 };

		const sorted = [...individualTickets]
			.filter((t) => t.ageRange.min !== null)
			.sort((a, b) => (a.ageRange.min ?? 0) - (b.ageRange.min ?? 0));

		// Gap before the first ticket
		const firstMin = sorted[0].ageRange.min ?? 0;
		if (firstMin > 0) {
			return { min: 0, max: firstMin - 1 };
		}

		// Gap between tickets
		for (let i = 0; i < sorted.length - 1; i++) {
			const currentMax = sorted[i].ageRange.max ?? 0;
			const nextMin = sorted[i + 1].ageRange.min ?? 0;
			if (nextMin > currentMax + 1) {
				return { min: currentMax + 1, max: nextMin - 1 };
			}
		}

		// After the last ticket
		const lastMax = sorted[sorted.length - 1].ageRange.max ?? 0;
		return { min: lastMax + 1, max: 99 };
	}

	/** Find the best available persons range gap. */
	function suggestPersonsRange(): { min: number; max: number | null } {
		if (groupTickets.length === 0) return { min: 1, max: null };

		const sorted = [...groupTickets].sort((a, b) => a.personsRange.min - b.personsRange.min);

		// Gap before the first ticket
		if (sorted[0].personsRange.min > 1) {
			return { min: 1, max: sorted[0].personsRange.min - 1 };
		}

		// Gap between tickets
		for (let i = 0; i < sorted.length - 1; i++) {
			const currentMax = sorted[i].personsRange.max;
			const nextMin = sorted[i + 1].personsRange.min;
			if (currentMax !== null && nextMin > currentMax + 1) {
				return { min: currentMax + 1, max: nextMin - 1 };
			}
		}

		// After the last ticket
		const lastMax = sorted[sorted.length - 1].personsRange.max;
		return { min: lastMax !== null ? lastMax + 1 : 1, max: null };
	}

	// ── Individual ticket dialog ──

	let individualDialog = $state<PureHtmlDialog>();
	let indGroup = $state<IndividualTicketGroup>(IndividualTicketGroup.ADULT);
	let indAgeMin = $state(0);
	let indAgeMax = $state<number>(99);

	const usedGroups = $derived(new Set(individualTickets.map((t) => t.group)));
	const availableGroups = $derived(
		INDIVIDUAL_TICKET_GROUP_OPTIONS.filter((o) => !usedGroups.has(o.id))
	);
	let indPrice = $state(0);
	let indCommissionSelection = $state<CommissionSelection>('SUPPLIER');
	let indCommission = $state(0);
	let indStatus = $state<IndividualTicketStatus>(IndividualTicketStatus.ACTIVE);
	let indFree = $state<IndividualTicketFree>(IndividualTicketFree.NO);
	let indNeeded = $state<IndividualTicketNeeded>(IndividualTicketNeeded.YES);
	let indAdultRequired = $state(false);

	const indIsFree = $derived(indFree === IndividualTicketFree.YES);

	function resetIndividualForm() {
		indGroup = availableGroups[0]?.id ?? IndividualTicketGroup.ADULT;
		const suggested = suggestAgeRange();
		indAgeMin = suggested.min;
		indAgeMax = suggested.max;
		indPrice = 0;
		indCommissionSelection = 'SUPPLIER';
		indCommission = 0;
		indStatus = IndividualTicketStatus.ACTIVE;
		indFree = IndividualTicketFree.NO;
		indNeeded = IndividualTicketNeeded.YES;
		indAdultRequired = false;
	}

	async function handleAddIndividual() {
		isAdding = true;
		try {
			const id = uuidv4();
			const priceInCents = indIsFree ? 0 : Math.round(indPrice * 100);
			const isSupplierComm = indCommissionSelection === 'SUPPLIER';
			const commissionCents = isSupplierComm ? null : Math.round(indCommission * 100) || null;
			const commKind = isSupplierComm ? null : (indCommissionSelection as CommissionKind);
			await ACTIVITY_OPTION_REQUEST.addIndividualTicket(fetch, data.option.id, {
				id,
				group: indGroup,
				price: priceInCents,
				commissionKind: commKind ?? undefined,
				commissionValue: commissionCents ?? undefined,
				status: indStatus,
				free: indFree,
				ticketNeeded: indNeeded,
				adultRequired: indAdultRequired,
				ageRange: { min: indAgeMin, max: indAgeMax }
			});
			individualTickets = [
				...individualTickets,
				{
					id,
					group: indGroup,
					price: priceInCents,
					commissionKind: commKind,
					commissionValue: commissionCents,
					status: indStatus,
					free: indFree,
					ticketNeeded: indNeeded,
					adultRequired: indAdultRequired,
					ageRange: { min: indAgeMin, max: indAgeMax }
				}
			];
			individualDialog?.close();
			resetIndividualForm();
			showToast('success', m.activities_optionTicketAdded());
		} catch {
			showToast('error', m.activities_optionTicketError());
		} finally {
			isAdding = false;
		}
	}

	async function handleRemoveIndividual(ticket: IndividualTicket) {
		const confirmed = await showConfirmDialog({
			title: m.activities_confirmDeleteTitle(),
			message: m.activities_confirmDeleteMessage(),
			confirmText: m.common_delete(),
			cancelText: m.common_cancel(),
			danger: true
		});
		if (!confirmed) return;

		isRemoving = ticket.id;
		try {
			await ACTIVITY_OPTION_REQUEST.removeIndividualTicket(fetch, data.option.id, ticket.id);
			individualTickets = individualTickets.filter((t) => t.id !== ticket.id);
			showToast('success', m.activities_optionTicketRemoved());
		} catch {
			showToast('error', m.activities_optionTicketError());
		} finally {
			isRemoving = null;
		}
	}

	// ── Group ticket dialog ──

	let groupDialog = $state<PureHtmlDialog>();
	let grpPersonsMin = $state(1);
	let grpPersonsMax = $state<number | null>(null);
	let grpPrice = $state(0);
	let grpCommissionSelection = $state<CommissionSelection>('SUPPLIER');
	let grpCommission = $state(0);
	let grpStatus = $state<GroupTicketStatus>(GroupTicketStatus.ACTIVE);

	function resetGroupForm() {
		const suggested = suggestPersonsRange();
		grpPersonsMin = suggested.min;
		grpPersonsMax = suggested.max;
		grpPrice = 0;
		grpCommissionSelection = 'SUPPLIER';
		grpCommission = 0;
		grpStatus = GroupTicketStatus.ACTIVE;
	}

	async function handleAddGroup() {
		isAdding = true;
		try {
			const id = uuidv4();
			const priceInCents = Math.round(grpPrice * 100);
			const isGrpSupplierComm = grpCommissionSelection === 'SUPPLIER';
			const grpCommissionCents = isGrpSupplierComm ? null : Math.round(grpCommission * 100) || null;
			const grpCommKind = isGrpSupplierComm ? null : (grpCommissionSelection as CommissionKind);
			await ACTIVITY_OPTION_REQUEST.addGroupTicket(fetch, data.option.id, {
				id,
				price: priceInCents,
				commissionKind: grpCommKind ?? undefined,
				commissionValue: grpCommissionCents ?? undefined,
				status: grpStatus,
				personsRange: { min: grpPersonsMin, max: grpPersonsMax }
			});
			groupTickets = [
				...groupTickets,
				{
					id,
					price: priceInCents,
					commissionKind: grpCommKind,
					commissionValue: grpCommissionCents,
					status: grpStatus,
					personsRange: { min: grpPersonsMin, max: grpPersonsMax }
				}
			];
			groupDialog?.close();
			resetGroupForm();
			showToast('success', m.activities_optionTicketAdded());
		} catch {
			showToast('error', m.activities_optionTicketError());
		} finally {
			isAdding = false;
		}
	}

	async function handleRemoveGroup(ticket: GroupTicket) {
		const confirmed = await showConfirmDialog({
			title: m.activities_confirmDeleteTitle(),
			message: m.activities_confirmDeleteMessage(),
			confirmText: m.common_delete(),
			cancelText: m.common_cancel(),
			danger: true
		});
		if (!confirmed) return;

		isRemoving = ticket.id;
		try {
			await ACTIVITY_OPTION_REQUEST.removeGroupTicket(fetch, data.option.id, ticket.id);
			groupTickets = groupTickets.filter((t) => t.id !== ticket.id);
			showToast('success', m.activities_optionTicketRemoved());
		} catch {
			showToast('error', m.activities_optionTicketError());
		} finally {
			isRemoving = null;
		}
	}
</script>

<div class="space-y-6">
	{#if !ticketKind}
		<div class="flex flex-col items-center gap-4 py-12">
			<Ticket class="text-base-content/20 size-10" />
			<p class="text-base-content/50 text-sm">{m.activities_optionTicketNoKindSelected()}</p>
			<div class="flex items-end gap-2">
				<div class="form-control">
					<label class="label text-sm" for="ticketKindSelect">
						<span>{m.activities_optionTicketKindLabel()}</span>
					</label>
					<select id="ticketKindSelect" class="select select-bordered" bind:value={selectedKind}>
						<option value="" disabled>{m.activities_optionTicketKindPlaceholder()}</option>
						{#each OPTION_TICKET_KIND_OPTIONS as opt (opt.id)}
							<option value={opt.id}>{opt.name}</option>
						{/each}
					</select>
				</div>
				<button
					type="button"
					class="btn btn-primary"
					disabled={!selectedKind || settingKind}
					onclick={handleSetTicketKind}
				>
					{#if settingKind}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					{m.common_confirm()}
				</button>
			</div>
		</div>
	{:else}
		<!-- Kind header -->
		<div class="bg-base-200/50 flex items-center gap-3 rounded-lg px-4 py-3">
			<Ticket class="text-base-content/40 size-5" />
			<span class="text-sm font-medium">
				{m.activities_optionTicketKindLabel()}:
				{OPTION_TICKET_KIND_OPTIONS.find((o) => o.id === ticketKind)?.name}
			</span>
			<button
				type="button"
				class="btn btn-ghost btn-xs ml-auto"
				onclick={() =>
					requestKindChange(
						ticketKind === OptionTicketKind.INDIVIDUAL
							? OptionTicketKind.GROUP
							: OptionTicketKind.INDIVIDUAL
					)}
			>
				{m.activities_optionTicketKindChangeButton()}
			</button>
		</div>

		{#if isIndividual}
			{#if individualTickets.length === 0}
				<div class="flex flex-col items-center gap-2 py-8">
					<Ticket class="text-base-content/20 size-10" />
					<p class="text-base-content/50 text-sm">{m.activities_optionTicketEmpty()}</p>
				</div>
			{:else}
				<div class="space-y-3">
					{#each individualTickets as ticket (ticket.id)}
						<div
							class="border-base-300 bg-base-100 flex items-center gap-4 rounded-lg border px-4 py-3"
						>
							<div class="min-w-0 flex-1">
								<span class="font-semibold">
									{INDIVIDUAL_TICKET_GROUP_OPTIONS.find((o) => o.id === ticket.group)?.name ??
										ticket.group}
								</span>
								<p class="text-base-content/50 mt-0.5 text-xs">
									{m.activities_optionTicketAgeRangeLabel()}:
									{ticket.ageRange.min ?? 0} – {ticket.ageRange.max ?? '∞'}
									· {ticket.free === 'YES'
										? m.activities_optionTicketFreeLabel()
										: formatPrice(ticket.price)}
									· {#if ticket.commissionValue}
										{(ticket.commissionValue / 100).toFixed(2)}{ticket.commissionKind === 'FIXED'
											? ' €'
											: ' %'}
									{:else}
										{m.activities_optionTicketCommissionKindSupplier()}
									{/if}
									· {INDIVIDUAL_TICKET_STATUS_OPTIONS.find((o) => o.id === ticket.status)?.name ??
										ticket.status}
								</p>
							</div>
							<button
								type="button"
								class="btn btn-ghost btn-xs text-error"
								disabled={isRemoving === ticket.id}
								onclick={() => handleRemoveIndividual(ticket)}
							>
								{#if isRemoving === ticket.id}
									<span class="loading loading-spinner loading-xs"></span>
								{:else}
									{m.activities_optionTicketDeleteButton()}
								{/if}
							</button>
						</div>
					{/each}
				</div>
			{/if}

			<button
				type="button"
				class="btn btn-ghost btn-sm text-primary"
				onclick={() => {
					resetIndividualForm();
					individualDialog?.showModal();
				}}
			>
				<Add class="size-4" />
				{m.activities_optionTicketAddIndividual()}
			</button>

			<!-- Individual ticket dialog -->
			<PureHtmlDialog bind:this={individualDialog} title={m.activities_optionTicketNewIndividual()}>
				{#snippet content()}
					<div class="space-y-4">
						<div class="grid grid-cols-2 gap-4">
							<div class="form-control">
								<label class="label text-sm" for="indGroup">
									<span>{m.activities_optionTicketGroupLabel()}</span>
								</label>
								<select id="indGroup" class="select w-full" bind:value={indGroup}>
									{#each availableGroups as opt (opt.id)}
										<option value={opt.id}>{opt.name}</option>
									{/each}
								</select>
							</div>
							<div class="form-control">
								<label class="label text-sm" for="indStatus">
									<span>{m.activities_optionTicketStatusLabel()}</span>
								</label>
								<select id="indStatus" class="select w-full" bind:value={indStatus}>
									{#each INDIVIDUAL_TICKET_STATUS_OPTIONS as opt (opt.id)}
										<option value={opt.id}>{opt.name}</option>
									{/each}
								</select>
							</div>
						</div>

						<div class="form-control">
							<span class="label text-sm">{m.activities_optionTicketAgeRangeLabel()}</span>
							<div class="flex items-center gap-2">
								<input type="number" class="input w-20" min="0" bind:value={indAgeMin} />
								<span class="text-base-content/50 text-sm"
									>{m.activities_optionTicketAgeRangeTo()}</span
								>
								<input type="number" class="input w-20" min="0" bind:value={indAgeMax} />
							</div>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="form-control">
								<label class="label text-sm" for="indFree">
									<span>{m.activities_optionTicketFreeLabel()}</span>
								</label>
								<select id="indFree" class="select w-full" bind:value={indFree}>
									{#each INDIVIDUAL_TICKET_FREE_OPTIONS as opt (opt.id)}
										<option value={opt.id}>{opt.name}</option>
									{/each}
								</select>
							</div>
							<div class="form-control">
								<label class="label text-sm" for="indPrice">
									<span>{m.activities_optionTicketPriceLabel()}</span>
								</label>
								<input
									id="indPrice"
									type="number"
									class="input w-full"
									step="0.01"
									min="0"
									disabled={indIsFree}
									value={indIsFree ? '0.00' : indPrice}
									oninput={(e) => {
										indPrice = parseFloat((e.target as HTMLInputElement).value || '0');
									}}
								/>
							</div>
						</div>

						<div class="grid grid-cols-3 gap-4">
							<div class="form-control">
								<label class="label text-sm" for="indCommissionKind">
									<span>{m.activities_optionTicketCommissionKindLabel()}</span>
								</label>
								<select
									id="indCommissionKind"
									class="select w-full"
									bind:value={indCommissionSelection}
								>
									{#each TICKET_COMMISSION_OPTIONS as opt (opt.id)}
										<option value={opt.id}>{opt.name}</option>
									{/each}
								</select>
							</div>
							{#if indCommissionSelection !== 'SUPPLIER'}
								<div class="form-control">
									<label class="label text-sm" for="indCommission">
										<span>{m.activities_optionTicketCommissionLabel()}</span>
										<span class="text-xs opacity-70">
											{indCommissionSelection === CommissionKind.FIXED ? '€' : '%'}
										</span>
									</label>
									<input
										id="indCommission"
										type="number"
										class="input w-full"
										step="0.01"
										min="0"
										bind:value={indCommission}
									/>
								</div>
							{/if}
							<div class="form-control">
								<label class="label text-sm" for="indNeeded">
									<span>{m.activities_optionTicketNeededLabel()}</span>
								</label>
								<select id="indNeeded" class="select w-full" bind:value={indNeeded}>
									{#each INDIVIDUAL_TICKET_NEEDED_OPTIONS as opt (opt.id)}
										<option value={opt.id}>{opt.name}</option>
									{/each}
								</select>
							</div>
						</div>

						<label class="label cursor-pointer justify-start gap-2 text-sm" for="indAdultRequired">
							<input
								id="indAdultRequired"
								type="checkbox"
								class="checkbox"
								bind:checked={indAdultRequired}
							/>
							<span>{m.activities_optionTicketAdultRequiredLabel()}</span>
						</label>
					</div>
				{/snippet}
				{#snippet actions()}
					<button type="button" class="btn btn-ghost" onclick={() => individualDialog?.close()}>
						{m.common_cancel()}
					</button>
					<button
						type="button"
						class="btn btn-primary"
						disabled={isAdding}
						onclick={handleAddIndividual}
					>
						{#if isAdding}
							<span class="loading loading-spinner loading-xs"></span>
						{/if}
						{m.activities_optionTicketCreateButton()}
					</button>
				{/snippet}
			</PureHtmlDialog>
		{:else if isGroup}
			{#if groupTickets.length === 0}
				<div class="flex flex-col items-center gap-2 py-8">
					<Ticket class="text-base-content/20 size-10" />
					<p class="text-base-content/50 text-sm">{m.activities_optionTicketEmptyGroup()}</p>
				</div>
			{:else}
				<div class="space-y-3">
					{#each groupTickets as ticket (ticket.id)}
						<div
							class="border-base-300 bg-base-100 flex items-center gap-4 rounded-lg border px-4 py-3"
						>
							<div class="min-w-0 flex-1">
								<span class="font-semibold">{formatPrice(ticket.price)}</span>
								<p class="text-base-content/50 mt-0.5 text-xs">
									{m.activities_optionTicketPersonsRangeLabel()}:
									{ticket.personsRange.min} – {ticket.personsRange.max ?? '∞'}
									· {#if ticket.commissionValue}
										{(ticket.commissionValue / 100).toFixed(2)}{ticket.commissionKind === 'FIXED'
											? ' €'
											: ' %'}
									{:else}
										{m.activities_optionTicketCommissionKindSupplier()}
									{/if}
									· {GROUP_TICKET_STATUS_OPTIONS.find((o) => o.id === ticket.status)?.name ??
										ticket.status}
								</p>
							</div>
							<button
								type="button"
								class="btn btn-ghost btn-xs text-error"
								disabled={isRemoving === ticket.id}
								onclick={() => handleRemoveGroup(ticket)}
							>
								{#if isRemoving === ticket.id}
									<span class="loading loading-spinner loading-xs"></span>
								{:else}
									{m.activities_optionTicketDeleteButton()}
								{/if}
							</button>
						</div>
					{/each}
				</div>
			{/if}

			<button
				type="button"
				class="btn btn-ghost btn-sm text-primary"
				onclick={() => {
					resetGroupForm();
					groupDialog?.showModal();
				}}
			>
				<Add class="size-4" />
				{m.activities_optionTicketAddGroup()}
			</button>

			<!-- Group ticket dialog -->
			<PureHtmlDialog bind:this={groupDialog} title={m.activities_optionTicketNewGroup()}>
				{#snippet content()}
					<div class="space-y-4">
						<div class="form-control">
							<span class="label text-sm">{m.activities_optionTicketPersonsRangeLabel()}</span>
							<div class="flex items-center gap-2">
								<input type="number" class="input w-20" min="1" bind:value={grpPersonsMin} />
								<span class="text-base-content/50 text-sm"
									>{m.activities_optionTicketAgeRangeTo()}</span
								>
								<input type="number" class="input w-20" min="1" bind:value={grpPersonsMax} />
							</div>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="form-control">
								<label class="label text-sm" for="grpPrice">
									<span>{m.activities_optionTicketPriceLabel()}</span>
								</label>
								<input
									id="grpPrice"
									type="number"
									class="input w-full"
									step="0.01"
									min="0"
									bind:value={grpPrice}
								/>
							</div>
							<div class="form-control">
								<label class="label text-sm" for="grpStatus">
									<span>{m.activities_optionTicketStatusLabel()}</span>
								</label>
								<select id="grpStatus" class="select w-full" bind:value={grpStatus}>
									{#each GROUP_TICKET_STATUS_OPTIONS as opt (opt.id)}
										<option value={opt.id}>{opt.name}</option>
									{/each}
								</select>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="form-control">
								<label class="label text-sm" for="grpCommissionKind">
									<span>{m.activities_optionTicketCommissionKindLabel()}</span>
								</label>
								<select
									id="grpCommissionKind"
									class="select w-full"
									bind:value={grpCommissionSelection}
								>
									{#each TICKET_COMMISSION_OPTIONS as opt (opt.id)}
										<option value={opt.id}>{opt.name}</option>
									{/each}
								</select>
							</div>
							{#if grpCommissionSelection !== 'SUPPLIER'}
								<div class="form-control">
									<label class="label text-sm" for="grpCommission">
										<span>{m.activities_optionTicketCommissionLabel()}</span>
										<span class="text-xs opacity-70">
											{grpCommissionSelection === CommissionKind.FIXED ? '€' : '%'}
										</span>
									</label>
									<input
										id="grpCommission"
										type="number"
										class="input w-full"
										step="0.01"
										min="0"
										bind:value={grpCommission}
									/>
								</div>
							{/if}
						</div>
					</div>
				{/snippet}
				{#snippet actions()}
					<button type="button" class="btn btn-ghost" onclick={() => groupDialog?.close()}>
						{m.common_cancel()}
					</button>
					<button
						type="button"
						class="btn btn-primary"
						disabled={isAdding}
						onclick={handleAddGroup}
					>
						{#if isAdding}
							<span class="loading loading-spinner loading-xs"></span>
						{/if}
						{m.activities_optionTicketCreateButton()}
					</button>
				{/snippet}
			</PureHtmlDialog>
		{/if}
	{/if}

	<!-- Change kind confirmation dialog -->
	<PureHtmlDialog bind:this={changeKindDialog} title={m.activities_optionTicketKindChangeTitle()}>
		{#snippet content()}
			<p>{m.activities_optionTicketKindChangeMessage()}</p>
		{/snippet}
		{#snippet actions()}
			<button class="btn" onclick={() => changeKindDialog?.close()}>
				{m.common_cancel()}
			</button>
			<button class="btn btn-warning" disabled={settingKind} onclick={confirmKindChange}>
				{#if settingKind}
					<span class="loading loading-spinner loading-sm"></span>
				{/if}
				{m.common_confirm()}
			</button>
		{/snippet}
	</PureHtmlDialog>
</div>
