<script lang="ts">
	// Types
	import type { PassengerLineItem } from '$lib/types';

	// Utils
	import { formatEuro } from '$lib/utils/currency';
	import { formatPassengersFromBooking } from '$lib/utils/passengers';
	import { formatActivityDate, formatSlotTime, bookingToISODateTime } from '$lib/utils/datetime';

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
	import Spacer from '$lib/components/marketplace/Spacer.svelte';

	const activeBookings = $derived(
		(shoppingCartStore.order?.bookings ?? []).filter((b) => !removedBookingsStore.has(b.id))
	);

	const activeBookingCount = $derived(activeBookings.length);
	const activeTotalAmount = $derived(
		activeBookings.reduce((sum, b) => sum + (b.subtotalPrice ?? 0), 0)
	);

	let editingBookingId = $state<string | null>(null);
	let provisionalPrice = $state<number | null>(null);
	let formCanSave = $state(false);
	let formIsSaving = $state(false);
	let formRef = $state<{ save: () => Promise<void> } | null>(null);
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
				{#each activeBookings as booking (booking.id)}
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
					<p class="h2 mt-6 mb-6">{formatActivityDate(booking.activityDatetime)}</p>

					<CheckoutCard
						variant="IS_BUENDIA"
						image="https://dummyimage.com/140x140/000/fff.jpg"
						title={[booking.activityTitle, booking.optionTitle].filter(Boolean).join(' · ')}
						rating={4.7}
						opinions={432}
						currentPrice={booking.subtotalPrice ?? undefined}
						previousPrice={booking.previousPrice ?? undefined}
						provisionalPrice={editingBookingId === booking.id
							? (provisionalPrice ?? undefined)
							: undefined}
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
					>
						{#snippet modifyForm()}
							{#if editingBookingId === booking.id}
								<BookingModifyForm
									bind:this={formRef}
									{booking}
									onSubtotalChange={(p) => (provisionalPrice = p)}
									onCanSaveChange={(v) => (formCanSave = v)}
									onIsSavingChange={(v) => (formIsSaving = v)}
									onSave={async () => {
										await shoppingCartStore.loadOrder();
										provisionalPrice = null;
										editingBookingId = null;
									}}
									onCancel={() => {
										provisionalPrice = null;
										editingBookingId = null;
									}}
								/>
							{/if}
						{/snippet}
						{#snippet actions()}
							{#if editingBookingId !== booking.id}
								<div class="flex gap-4">
									<button
										type="button"
										class="e-button e-button-link e-button-link-accent"
										onclick={() => (editingBookingId = booking.id)}>Modificar</button
									>
									<button
										type="button"
										class="e-button e-button-link e-button-link-accent"
										onclick={() => removedBookingsStore.add(booking)}>Eliminar</button
									>
								</div>
							{:else}
								<div class="flex gap-3">
									<button
										type="button"
										class="e-button e-button-link e-button-link-accent"
										disabled={!formCanSave || formIsSaving}
										onclick={() => formRef?.save()}
									>
										{formIsSaving ? '...' : 'Guardar'}
									</button>
									<button
										type="button"
										class="e-button e-button-link e-button-link-accent"
										disabled={formIsSaving}
										onclick={() => {
											provisionalPrice = null;
											editingBookingId = null;
										}}
									>
										Cancelar
									</button>
								</div>
							{/if}
						{/snippet}
					</CheckoutCard>
				{/each}
			{:else}
				<p class="mt-6">No hay bookings</p>
			{/if}

			{#if removedBookingsStore.bookings.length}
				{#if activeBookings.length == 0}
					<Spacer />
				{/if}

				<p class="h3 mt-6 mb-4">Anteriormente en tu carrito</p>

				{#each removedBookingsStore.bookings as booking (booking.id)}
					<CheckoutCard
						variant="IS_BUENDIA"
						disabled={true}
						image="https://dummyimage.com/140x140/000/fff.jpg"
						title={[booking.activityTitle, booking.optionTitle].filter(Boolean).join(' · ')}
						rating={4.7}
						opinions={432}
						currentPrice={booking.subtotalPrice ?? undefined}
						previousPrice={booking.previousPrice ?? undefined}
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
								iconColor: 'text-success-700',
								text: 'Cancelación gratuita hasta el inicio de la actividad'
							}
						]}
					>
						{#snippet actions()}
							<span
								class="text-accent cursor-pointer underline underline-offset-8"
								role="button"
								tabindex="0"
								onclick={() => removedBookingsStore.restore(booking.id)}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') removedBookingsStore.restore(booking.id);
								}}>Volver a añadir al carrito</span
							>
						{/snippet}
					</CheckoutCard>
				{/each}
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
				bookingCount={activeBookingCount}
				totalAmount={activeTotalAmount}
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
