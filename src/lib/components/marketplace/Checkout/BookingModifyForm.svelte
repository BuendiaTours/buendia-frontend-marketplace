<script lang="ts">
	// Types
	import type { ActivityOption, CartBooking } from '$lib/types';

	// Libs
	import { untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { parseDate } from '@internationalized/date';

	// Utils
	import { formatSlotTime, bookingToISODateTime } from '$lib/utils/datetime';

	// Store
	import { createCheckout } from '$lib/stores/checkout.svelte';
	import { proxyApiRoutes } from '$lib/api/proxy-routes';

	// Components
	import CheckoutStepCounterSelector from './CheckoutStepCounterSelector.svelte';
	import CheckoutMeltDatepicker from './CheckoutMeltDatepicker.svelte';

	type Props = {
		booking: CartBooking;
		onSave: () => void;
		onCancel: () => void;
		onSubtotalChange?: (price: number | null) => void;
		onCanSaveChange?: (v: boolean) => void;
		onIsSavingChange?: (v: boolean) => void;
	};

	let { booking, onSave, onCancel, onSubtotalChange, onCanSaveChange, onIsSavingChange }: Props =
		$props();

	export async function save() {
		await handleSave();
	}

	let singleOption = $state<ActivityOption | null>(null);
	let isLoading = $state(true);
	let fetchError = $state<string | null>(null);
	let selectedSlotId = $state<string | null>(null);

	// Compute initial passenger counts from the current booking (captured once at mount)
	const initialCounts = untrack(() => {
		const map = new SvelteMap<string, number>();
		for (const p of booking.passengers) {
			if (!p.group) continue;
			map.set(p.group, (map.get(p.group) ?? 0) + 1);
		}
		return map;
	});

	// Create a checkout context scoped to this component's subtree
	const checkout = untrack(() => createCheckout(booking.activityId ?? '', initialCounts));

	// Fetch the single ActivityOption for this booking
	$effect(() => {
		const activityId = booking.activityId;
		if (!activityId) {
			isLoading = false;
			return;
		}
		fetch(proxyApiRoutes.activityOptions.byActivity(activityId))
			.then((r) => r.json())
			.then((options: ActivityOption[]) => {
				singleOption = options.find((o) => o.id === booking.optionId) ?? null;
				if (singleOption) checkout.activityOptions = [singleOption];
			})
			.catch((e: unknown) => {
				fetchError = e instanceof Error ? e.message : 'Error desconocido';
			})
			.finally(() => {
				isLoading = false;
			});
	});

	// Pre-select the booking's current date (once, when selectedDate is still null)
	$effect(() => {
		if (checkout.selectedDate !== null || !booking.date) return;
		checkout.selectedDate = parseDate(booking.date);
	});

	// Slots for this specific option on the selected date
	const slotsForOption = $derived(
		checkout.selectedDateSlots.filter((s) => s.optionId === booking.optionId)
	);

	// Auto-select slot when date or available slots change
	$effect(() => {
		const slots = slotsForOption;
		if (slots.length === 0) {
			selectedSlotId = null;
			return;
		}
		untrack(() => {
			const currentTimeStr = booking.startTime ? `T${booking.startTime}:00` : null;
			const match = currentTimeStr ? slots.find((s) => s.dateTime.includes(currentTimeStr)) : null;
			selectedSlotId = match?.id ?? slots.find((s) => !checkout.isSlotDisabled(s))?.id ?? null;
		});
	});

	// Active ticket groups from the loaded option
	const activeTicketGroups = $derived(
		singleOption ? singleOption.individualTickets.filter((t) => t.status === 'ACTIVE') : []
	);

	// Reactive price preview
	const subtotal = $derived.by(() => {
		if (!singleOption) return null;
		let total = 0;
		for (const ticket of singleOption.individualTickets) {
			total += (checkout.counts.get(ticket.group) ?? 0) * (ticket.newPrice ?? ticket.price);
		}
		return total;
	});

	$effect(() => {
		onSubtotalChange?.(subtotal);
	});

	// Save guard
	const selectedSlot = $derived(slotsForOption.find((s) => s.id === selectedSlotId));
	const canSave = $derived(
		!!selectedSlot && !checkout.isSlotDisabled(selectedSlot) && checkout.totalTickets > 0
	);

	$effect(() => {
		onCanSaveChange?.(canSave);
	});

	let isSaving = $state(false);

	$effect(() => {
		onIsSavingChange?.(isSaving);
	});
	let saveError = $state<string | null>(null);

	async function handleSave() {
		if (!canSave || !selectedSlot || !singleOption) return;

		const patch: Record<string, unknown> = {};

		// Include activityDatetime only if it changed
		const originalDatetime =
			booking.date && booking.startTime
				? bookingToISODateTime(booking.date, booking.startTime)
				: null;
		if (selectedSlot.dateTime !== originalDatetime) {
			patch.activityDatetime = selectedSlot.dateTime;
		}

		// Include passengers only if counts changed
		const originalCounts = new SvelteMap<string, number>();
		for (const p of booking.passengers) {
			if (!p.group) continue;
			originalCounts.set(p.group, (originalCounts.get(p.group) ?? 0) + 1);
		}
		const countsChanged =
			[...checkout.counts.entries()].some(([g, v]) => (originalCounts.get(g) ?? 0) !== v) ||
			[...originalCounts.entries()].some(([g, v]) => (checkout.counts.get(g) ?? 0) !== v);

		if (countsChanged) {
			patch.passengers = singleOption.individualTickets
				.filter((t) => t.status === 'ACTIVE')
				.flatMap((t) => {
					const count = checkout.counts.get(t.group) ?? 0;
					return Array.from({ length: count }, () => ({
						id: crypto.randomUUID(),
						individualTicketId: t.id
					}));
				});
		}

		if (Object.keys(patch).length === 0) {
			onCancel();
			return;
		}

		isSaving = true;
		saveError = null;
		try {
			const res = await fetch(proxyApiRoutes.bookings.patch(booking.id), {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(patch)
			});
			if (!res.ok) throw new Error(`Error ${res.status}`);
			onSave();
		} catch (e: unknown) {
			saveError = e instanceof Error ? e.message : 'Error al guardar';
		} finally {
			isSaving = false;
		}
	}
</script>

{#if isLoading}
	<div class="space-y-2">
		<div class="h-10 w-full animate-pulse rounded bg-neutral-200"></div>
		<div class="h-10 w-full animate-pulse rounded bg-neutral-200"></div>
	</div>
{:else if fetchError}
	<p class="text-red-600">{fetchError}</p>
{:else if singleOption}
	<div class="w-full space-y-2">
		<CheckoutStepCounterSelector {activeTicketGroups} />

		<CheckoutMeltDatepicker
			value={checkout.selectedDate ?? undefined}
			disabled={checkout.totalTickets === 0}
			isDateDisabled={checkout.checkDateDisabled}
			onSelect={(date) => (checkout.selectedDate = date)}
			onMonthChange={(from) => checkout.loadAvailabilityFrom(from)}
		/>

		{#if slotsForOption.length > 1}
			<select class="select select-lg w-full" bind:value={selectedSlotId}>
				{#each slotsForOption as slot (slot.id)}
					<option value={slot.id} disabled={checkout.isSlotDisabled(slot)}>
						{formatSlotTime(slot.dateTime)}
					</option>
				{/each}
			</select>
		{/if}

		{#if saveError}
			<p class="text-red-600">{saveError}</p>
		{/if}
	</div>
{/if}
