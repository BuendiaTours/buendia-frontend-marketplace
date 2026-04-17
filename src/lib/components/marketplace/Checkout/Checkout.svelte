<script lang="ts">
	// Types
	import type { ActivityOption } from '$lib/types';

	// Components
	import { getCheckout } from '$lib/stores/checkout.svelte';
	import CheckoutMeltDatepicker from './CheckoutMeltDatepicker.svelte';
	import CheckoutStepCounterSelector from './CheckoutStepCounterSelector.svelte';

	// Icons
	import { CheckCircle } from '$lib/icons/Linear';

	// Utils
	import { formatEuro } from '$lib/utils/currency';

	type Props = { activityOptions: ActivityOption[] };
	let { activityOptions }: Props = $props();

	const checkout = getCheckout();

	$effect(() => {
		checkout.activityOptions = activityOptions;
	});

	const minAdultPrice = $derived.by(() => {
		const adultIds = new Set(
			activityOptions
				.flatMap((o) => o.individualTickets)
				.filter((t) => t.group === 'ADULT')
				.map((t) => t.id)
		);
		let min = Infinity;
		for (const slot of checkout.availability)
			for (const t of slot.tickets) if (adultIds.has(t.id) && t.price < min) min = t.price;
		return min === Infinity ? null : min;
	});

	const activeTicketGroups = $derived([
		...new Map(
			activityOptions
				.flatMap((opt) => opt.individualTickets)
				.filter((t) => t.status === 'ACTIVE')
				.map((t) => [t.group, t])
		).values()
	]);
</script>

<div class="carrito">
	{#if checkout.isLoading}
		<div class="carrito__loading space-y-3 p-4">
			<div class="h-5 w-3/4 animate-pulse rounded bg-neutral-200"></div>
			<div class="h-5 w-1/2 animate-pulse rounded bg-neutral-200"></div>
			<div class="h-10 w-full animate-pulse rounded bg-neutral-200"></div>
		</div>
	{:else if checkout.error}
		<div class="carrito__error p-sm p-4 text-red-600">{checkout.error}</div>
	{:else if activeTicketGroups.length === 0}
		<div class="carrito__empty p-sm p-4 text-neutral-500">Sin disponibilidad</div>
	{:else}
		<div class="cart rounded-xl border border-solid border-neutral-300 bg-white p-6">
			<div class="mb-4 flex flex-col">
				<p class="p-base">
					Desde <strike>99,00 €</strike> <span class="p-base text-salmon-strong">-15%</span>
				</p>
				<p class="text-price text-salmon-strong">
					{#if minAdultPrice !== null}
						{formatEuro(minAdultPrice)}
					{/if}
					<span class="p-base ml-2 font-bold text-neutral-800">por persona</span>
				</p>
			</div>

			<CheckoutStepCounterSelector {activeTicketGroups} />

			<CheckoutMeltDatepicker
				value={checkout.selectedDate ?? undefined}
				disabled={checkout.totalTickets === 0}
				isDateDisabled={checkout.checkDateDisabled}
				onSelect={(date) => (checkout.selectedDate = date)}
				onMonthChange={(fromDate) => checkout.loadAvailabilityFrom(fromDate)}
				wrapperClass="mt-4"
			/>

			<div class="mt-4 flex flex-col gap-1">
				<p class="p-base flex gap-2 text-neutral-800">
					<CheckCircle class="text-success-700 h-6 shrink-0 grow-0 basis-6" />
					Cancelación gratuita hasta el inicio de la actividad
				</p>
				<p class="p-base flex gap-2 text-neutral-800">
					<CheckCircle class="text-success-700 h-6 shrink-0 grow-0 basis-6" />
					Garantía de reembolso si no te gusta
				</p>
			</div>
		</div>
	{/if}
</div>
