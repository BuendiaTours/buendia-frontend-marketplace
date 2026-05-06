<script lang="ts">
	// Types
	import type { CartOrder, PassengerLineItem } from '$lib/types';

	// Libs
	import { formatEuro } from '$lib/utils/currency';
	import { formatActivityDate } from '$lib/utils/datetime';
	import { formatPassengersFromBooking } from '$lib/utils/passengers';

	// Store
	import { shoppingCartStore } from '$lib/stores/shoppingCart.svelte';

	// Components
	import CheckoutCard from './CheckoutCard.svelte';
	import { AltArrowDown, AltArrowUp } from '$lib/icons/Linear';

	let { order: orderProp = null }: { order?: CartOrder | null } = $props();

	const order = $derived(orderProp ?? shoppingCartStore.order);
	const bookingCount = $derived(order?.bookings?.length ?? 0);
	const totalAmount = $derived(order?.totalAmount ?? 0);
	let open = $state(false);
	let isLg = $state(false);

	$effect(() => {
		const mq = window.matchMedia('(min-width: 1024px)');
		isLg = mq.matches;
		const handler = (e: MediaQueryListEvent) => (isLg = e.matches);
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});
</script>

{#if order?.bookings?.length}
	<details
		class="mb-5 rounded-xl border border-solid border-neutral-300 p-3 lg:mb-0 lg:border-0 lg:p-0"
		open={open || isLg}
		ontoggle={(e) => (open = !open)}
	>
		<summary class="list-none [&::-webkit-details-marker]:hidden">
			<div
				class="col-sidebar__shopping-cart-resume__header flex flex-col lg:mt-1 lg:mb-3 lg:flex-row lg:items-center lg:justify-between"
			>
				<div class="flex justify-between">
					<p class="p-lg lg:h3 font-bold">
						Tu pedido <span class="font-normal lg:font-bold"
							>({bookingCount} {bookingCount > 1 ? 'planes' : 'plan'})</span
						>
					</p>
					{#if open}
						<AltArrowUp class="text-gray-700 lg:hidden" size={16} />
					{:else}
						<AltArrowDown class="text-gray-700 lg:hidden" size={16} />
					{/if}
				</div>
				<div class="flex items-end justify-between gap-2 {open ? 'mb-5 lg:mb-0' : ''}">
					<span class="p-xs text-neutral-600 lg:hidden">Todas las tasas e impuestos incluidos</span>
					<span class="text-price">{formatEuro(totalAmount)}</span>
				</div>
			</div>
		</summary>

		{#each order.bookings as booking (booking.id)}
			{@const passengerItems = Object.values(
				(booking.passengers ?? []).reduce(
					(acc, p) => {
						if (!p.group) return acc;
						if (!acc[p.group])
							acc[p.group] = { group: p.group, count: 0, unitPrice: p.priceAtBooking ?? 0 };
						acc[p.group].count++;
						return acc;
					},
					{} as Record<string, PassengerLineItem>
				)
			)}
			<CheckoutCard
				variant="IS_BUENDIA"
				image="https://dummyimage.com/140x140/000/fff.jpg"
				title={[booking.activityTitle, booking.optionTitle].filter(Boolean).join(' · ')}
				rating={4.7}
				opinions={432}
				currentPrice={booking.subtotalPrice ?? undefined}
				previousPrice={booking.previousPrice ?? undefined}
				{passengerItems}
				list={[
					{
						icon: 'Ticket',
						text: 'Con entradas al Palacio da Pena y Quinta da Regaleira'
					},
					...(booking.passengers?.length
						? [{ icon: 'User', text: formatPassengersFromBooking(booking.passengers) ?? '' }]
						: []),
					...(booking.activityDatetime
						? [{ icon: 'Calendar', text: formatActivityDate(booking.activityDatetime) }]
						: []),
					...(booking.startTime ? [{ icon: 'ClockCircle', text: booking.startTime }] : []),
					{
						icon: 'CheckCircle',
						iconColor: 'text-green-500',
						text: 'Cancelación gratuita hasta el inicio de la actividad'
					}
				]}
			></CheckoutCard>
		{/each}
	</details>
{:else}
	<p class="p-base">No hay reservas para mostrar.</p>
{/if}
