<script lang="ts">
	import { fade } from 'svelte/transition';

	// Icons
	import { CartLarge4, CustomMiniCancel } from '$lib/icons/Linear';

	// Types
	import type { PassengerLineItem } from '$lib/types';

	// Utils
	import { formatEuro } from '$lib/utils/currency';
	import { formatSlotTime, bookingToISODateTime } from '$lib/utils/datetime';

	// Components
	import { cartStore } from '$lib/stores/shoppingCart.svelte';
	import { createPopover, melt } from '@melt-ui/svelte';
	import { showConfirmDialog } from '$lib/actions/marketplace/confirmAction';
	import Callout from '$lib/components/marketplace/Callout.svelte';
	import PassengerBreakdown from '$lib/components/marketplace/ShoppingCart/PassengerBreakdown.svelte';

	const CART_EXPIRY_MS = 20 * 60 * 1000;

	const cartRemainingMinutes = $derived.by(() => {
		if (!cartStore.orderId || typeof window === 'undefined') return null;
		const createdAt = localStorage.getItem('cart_created_at');
		if (!createdAt) return null;
		const remaining = Math.ceil(
			(CART_EXPIRY_MS - (Date.now() - new Date(createdAt).getTime())) / 60000
		);
		return remaining > 0 ? remaining : null;
	});

	const {
		elements: { trigger, content },
		states: { open }
	} = createPopover({
		forceVisible: true,
		positioning: { placement: 'bottom-end', gutter: 8 }
	});
</script>

<button use:melt={$trigger} class="relative cursor-pointer p-2">
	<CartLarge4 class="size-6" />
	{#if cartStore.bookingCount > 0}
		<span
			class="p-xs absolute top-0 right-0 flex size-5 items-center justify-center rounded-full bg-red-500 font-bold text-white"
		>
			{cartStore.bookingCount}
		</span>
	{/if}
</button>

{#if $open}
	<div
		use:melt={$content}
		transition:fade={{ duration: 100 }}
		class="z-50 max-h-[80vh] w-[480px] overflow-auto rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
	>
		{#if cartStore.order?.bookings?.length}
			{#if cartRemainingMinutes}
				<Callout
					style="warning-high"
					size="small"
					items={[
						{
							id: 'cart-expiry',
							icon: 'History2',
							title: `Plazas reservadas durante ${cartRemainingMinutes} minuto${cartRemainingMinutes !== 1 ? 's' : ''}`,
							description: ''
						}
					]}
					wrapperClass="mb-4"
				/>
			{/if}
			<p class="p-xs mb-2 font-bold text-gray-700">
				Tienes ({cartStore.bookingCount}) planes en tu carrito
			</p>
			<ul class="p-xs mb-4 flex flex-col gap-2">
				{#each cartStore.order.bookings as booking (booking.id)}
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
					<li class="relative rounded border border-gray-200 p-2">
						{#if booking.activityTitle || booking.optionTitle}
							<p class="p-sm font-semibold text-gray-800">
								{#if booking.activityTitle}
									{@const slug = booking.activityId
										? cartStore.activitySlugs.get(booking.activityId)
										: undefined}
									{#if slug}
										<a href="/actividad/{slug}" class="hover:underline">{booking.activityTitle}</a>
									{:else}
										{booking.activityTitle}
									{/if}{booking.optionTitle ? ' · ' : ''}
								{/if}{booking.optionTitle ?? ''}
							</p>
						{/if}
						<p class="p-xs">booking_id:{booking.id}</p>
						<p class="p-xs">option_id: <span class="p-xs font-mono">{booking.optionId}</span></p>
						{#if booking.date}
							<p class="p-sm">
								Fecha: {booking.date}
								{#if booking.startTime}{formatSlotTime(
										bookingToISODateTime(booking.date, booking.startTime)
									)}{/if}
							</p>
						{/if}
						<p class="p-sm">Estado: {booking.status}</p>
						<PassengerBreakdown items={passengerItems} itemClass="p-sm" />
						{#if booking.subtotalPrice != null}
							<p class="p-sm font-semibold">{formatEuro(booking.subtotalPrice)}</p>
						{/if}

						<button
							type="button"
							class="e-button e-button-danger e-button-square e-button-xs absolute top-1 right-1"
							disabled={cartStore.isLoading}
							onclick={async () => {
								const ok = await showConfirmDialog({
									title: 'Eliminar reserva',
									message: '¿Seguro que quieres eliminar esta reserva?',
									danger: true,
									confirmText: 'Eliminar'
								});
								if (ok) cartStore.removeBooking(booking.id);
							}}
						>
							<CustomMiniCancel class="size-4" />
						</button>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="p-xs mb-4 text-gray-400">No hay bookings</p>
		{/if}

		<details>
			<summary class="p-xs">shoppingCart debug</summary>
			<pre class="p-xs font-mono break-all whitespace-pre-wrap text-gray-700">{JSON.stringify(
					{
						orderId: cartStore.orderId,
						userId: cartStore.userId,
						isLoading: cartStore.isLoading,
						error: cartStore.error,
						bookingCount: cartStore.bookingCount,
						totalAmount: cartStore.totalAmount,
						order: $state.snapshot(cartStore.order)
					},
					null,
					2
				)}</pre>
		</details>
	</div>
{/if}
