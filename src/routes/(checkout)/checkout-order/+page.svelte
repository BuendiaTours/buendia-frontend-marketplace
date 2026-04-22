<script lang="ts">
	// Types
	import type { PassengerLineItem } from '$lib/types';

	// Utils
	import { formatEuro } from '$lib/utils/currency';
	import { formatSlotTime, bookingToISODateTime } from '$lib/utils/datetime';

	// Stores
	import { goto } from '$app/navigation';
	import { shoppingCartStore } from '$lib/stores/shoppingCart.svelte';
	import { removedBookingsStore } from '$lib/stores/removedBookings.svelte';

	// Components
	import BookingModifyForm from '$lib/components/marketplace/checkout/BookingModifyForm.svelte';
	import CartExpiryCallout from '$lib/components/marketplace/ShoppingCart/CartExpiryCallout.svelte';
	import CheckoutCard from '$lib/components/marketplace/checkout/CheckoutCard.svelte';
	import PassengerBreakdown from '$lib/components/marketplace/ShoppingCart/PassengerBreakdown.svelte';
	import TotalResume from '$lib/components/marketplace/checkout/TotalResume.svelte';

	const activeBookings = $derived(
		(shoppingCartStore.order?.bookings ?? []).filter((b) => !removedBookingsStore.has(b.id))
	);

	let editingBookingId = $state<string | null>(null);
</script>

<div class="wrapper">
	<div class="page-grid gap-x-12">
		<div class="col-content">
			{#if activeBookings.length}
				<p class="h1">Tienes {activeBookings.length} planes en tu carrito</p>
			{:else}
				<p class="h1">Tu carrito está vacío</p>
			{/if}

			<CartExpiryCallout wrapperClass="mt-6" />

			{#if activeBookings.length}
				<ul class="mt-6 space-y-8">
					{#each activeBookings as booking (booking.id)}
						<CheckoutCard
							isBuendia={true}
							disabled={true}
							image="https://dummyimage.com/140x140/000/fff.jpg"
							title="Excursión a Sintra, Palacio da Pena, Quinta da Regaleira y Cabo da Roca desde Lisboa"
							rating={4.7}
							opinions={432}
							list={[
								{
									icon: 'Ticket',
									text: 'Con entradas al Palacio da Pena y Quinta da Regaleira'
								},
								{
									icon: 'User',
									text: '3 adultos'
								},
								{
									icon: 'Calendar',
									text: 'Domingo, 20 de julio del 2026'
								},
								{
									icon: 'ClockCircle',
									text: '11:00'
								},
								{
									icon: 'CheckCircle',
									iconColor: 'text-green-500',
									text: 'Cancelación gratuita hasta el inicio de la actividad'
								}
							]}
							cancellation="Cancelación gratuita hasta el inicio de la actividad"
						/>

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
						<li>
							{#if booking.activityTitle || booking.optionTitle}
								<p>
									{#if booking.activityTitle}{booking.activityTitle}{booking.optionTitle
											? ' · '
											: ''}{/if}{booking.optionTitle ?? ''}
								</p>
							{/if}
							<p>booking_id: {booking.id}</p>
							<p>option_id: {booking.optionId}</p>
							{#if booking.date}
								<p>
									Fecha: {booking.date}
									{#if booking.startTime}{formatSlotTime(
											bookingToISODateTime(booking.date, booking.startTime)
										)}{/if}
								</p>
							{/if}
							<p>Estado: {booking.status}</p>
							<PassengerBreakdown items={passengerItems} />
							{#if booking.subtotalPrice != null}
								<p>{formatEuro(booking.subtotalPrice)}</p>
							{/if}
							{#if editingBookingId !== booking.id}
								<div>
									<span
										class="cursor-pointer underline underline-offset-8"
										role="button"
										tabindex="0"
										onclick={() => (editingBookingId = booking.id)}
										onkeydown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') editingBookingId = booking.id;
										}}>Modificar</span
									>
									<span
										class="cursor-pointer underline underline-offset-8"
										role="button"
										tabindex="0"
										onclick={() => removedBookingsStore.add(booking)}
										onkeydown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') removedBookingsStore.add(booking);
										}}>Eliminar</span
									>
								</div>
							{/if}
							{#if editingBookingId === booking.id}
								<BookingModifyForm
									{booking}
									onSave={async () => {
										await shoppingCartStore.loadOrder();
										editingBookingId = null;
									}}
									onCancel={() => (editingBookingId = null)}
								/>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p>No hay bookings</p>
			{/if}

			{#if removedBookingsStore.bookings.length}
				<p class="mt-12 mb-4">Anteriormente en tu carrito</p>
				<ul class="space-y-8">
					{#each removedBookingsStore.bookings as booking (booking.id)}
						<li>
							{#if booking.activityTitle || booking.optionTitle}
								<p>
									{#if booking.activityTitle}{booking.activityTitle}{booking.optionTitle
											? ' · '
											: ''}{/if}{booking.optionTitle ?? ''}
								</p>
							{/if}
							{#if booking.subtotalPrice != null}
								<p>{formatEuro(booking.subtotalPrice)}</p>
							{/if}
							<span
								class="cursor-pointer underline underline-offset-8"
								role="button"
								tabindex="0"
								onclick={() => removedBookingsStore.restore(booking.id)}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') removedBookingsStore.restore(booking.id);
								}}>Volver a añadir al carrito</span
							>
						</li>
					{/each}
				</ul>
			{/if}

			<details class="mt-12">
				<summary>shoppingCart debug</summary>
				<pre>{JSON.stringify(
						{
							orderId: shoppingCartStore.orderId,
							userId: shoppingCartStore.userId,
							isLoading: shoppingCartStore.isLoading,
							error: shoppingCartStore.error,
							bookingCount: shoppingCartStore.bookingCount,
							totalAmount: shoppingCartStore.totalAmount,
							order: $state.snapshot(shoppingCartStore.order)
						},
						null,
						2
					)}</pre>
			</details>
		</div>
		<div class="col-sidebar pt-6">
			<TotalResume
				bookingCount={shoppingCartStore.bookingCount}
				totalAmount={shoppingCartStore.totalAmount}
				wrapperClass="mt-6 mb-6"
			>
				{#snippet actions()}
					<button
						class="e-button w-full"
						disabled={!activeBookings.length}
						onclick={() => goto('/checkout-personal-data')}>Tramitar pedido</button
					>
				{/snippet}
			</TotalResume>
		</div>
	</div>
</div>
