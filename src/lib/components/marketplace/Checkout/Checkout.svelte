<script lang="ts">
	import type { ActivityOption } from '$lib/types';
	import { getCheckout } from '$lib/stores/checkout.svelte';
	import CheckoutStepCounter from './CheckoutStepCounter.svelte';
	import CheckoutMeltDatepicker from './CheckoutMeltDatepicker.svelte';

	type Props = { activityOptions: ActivityOption[] };
	let { activityOptions }: Props = $props();

	const checkout = getCheckout();

	$effect(() => {
		checkout.activityOptions = activityOptions;
	});

	const activeTicketGroups = $derived([
		...new Map(
			activityOptions
				.flatMap((opt) => opt.individualTickets)
				.filter((t) => t.status === 'ACTIVE')
				.map((t) => [t.group, t])
		).values()
	]);

	const adultCount = $derived(checkout.counts.get('ADULT') ?? 0);
</script>

<div class="carrito">
	{#if checkout.isLoading}
		<div class="carrito__loading space-y-3 p-4">
			<div class="h-5 w-3/4 animate-pulse rounded bg-neutral-200"></div>
			<div class="h-5 w-1/2 animate-pulse rounded bg-neutral-200"></div>
			<div class="h-10 w-full animate-pulse rounded bg-neutral-200"></div>
		</div>
	{:else if checkout.error}
		<div class="carrito__error p-4 text-sm text-red-600">{checkout.error}</div>
	{:else if activeTicketGroups.length === 0}
		<div class="carrito__empty p-4 text-sm text-neutral-500">Sin disponibilidad</div>
	{:else}
		<div class="carrito__tickets space-y-4 p-4">
			<p class="p-base">Número total de tickets: {checkout.totalTickets}</p>
			{#each activeTicketGroups as ticket (ticket.id)}
				<CheckoutStepCounter
					key={ticket.group}
					id={ticket.id}
					value={checkout.counts.get(ticket.group) ?? 0}
					maxvalue={ticket.adultRequired && adultCount === 0 ? 0 : 99}
					onchange={(v) => checkout.counts.set(ticket.group, v)}
				/>
				{#if ticket.adultRequired && adultCount === 0 && (checkout.counts.get(ticket.group) ?? 0) > 0}
					<p class="p-sm text-error-500">Se precisa al menos un ticket de adulto</p>
				{/if}
			{/each}
		</div>

		<CheckoutMeltDatepicker
			value={checkout.selectedDate ?? undefined}
			disabled={checkout.totalTickets === 0}
			isDateDisabled={checkout.checkDateDisabled}
			onSelect={(date) => (checkout.selectedDate = date)}
			onMonthChange={(fromDate) => checkout.loadAvailabilityFrom(fromDate)}
		/>
	{/if}
</div>
