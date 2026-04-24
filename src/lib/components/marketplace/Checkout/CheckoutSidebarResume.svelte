<script lang="ts">
	// Types
	import type { PassengerLineItem } from '$lib/types';

	// Libs
	import { formatEuro } from '$lib/utils/currency';
	import { formatActivityDate } from '$lib/utils/datetime';
	import { formatPassengersFromBooking } from '$lib/utils/passengers';

	// Store
	import { shoppingCartStore } from '$lib/stores/shoppingCart.svelte';

	// Components
	import CheckoutCard from './CheckoutCard.svelte';
</script>

{#if shoppingCartStore.order?.bookings?.length}
	<div
		class="col-sidebar__shopping-cart-resume__header mt-1 mb-3 flex items-center justify-between"
	>
		<span class="h3">Tu pedido ({shoppingCartStore.bookingCount} planes)</span>
		<span class="text-price">{formatEuro(shoppingCartStore.totalAmount ?? 0)}</span>
	</div>

	{#each shoppingCartStore.order.bookings as booking (booking.id)}
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
{:else}
	<p class="p-base">No hay reservas para mostrar.</p>
{/if}
