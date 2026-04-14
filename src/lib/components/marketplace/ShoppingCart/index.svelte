<script lang="ts">
	import { createPopover, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import { CartLarge4 } from '$lib/icons/Linear';
	import { cartStore } from '$lib/stores/shoppingCart.svelte';

	const {
		elements: { trigger, content },
		states: { open }
	} = createPopover({
		forceVisible: true,
		positioning: { placement: 'bottom-end', gutter: 8 }
	});
</script>

<button use:melt={$trigger} class="relative p-2">
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
			<p class="p-xs mb-2 font-bold text-gray-700">Bookings ({cartStore.bookingCount})</p>
			<ul class="p-xs mb-4 flex flex-col gap-2">
				{#each cartStore.order.bookings as booking (booking.id)}
					<li class="rounded border border-gray-200 p-2">
						<p class="p-xs font-mono text-gray-500">{booking.id}</p>
						<p class="p-sm">Opción: <span class="p-xs font-mono">{booking.optionId}</span></p>
						{#if booking.date}
							<p class="p-sm">Fecha: {booking.date} {booking.startTime ?? ''}</p>
						{/if}
						<p class="p-sm">Estado: {booking.status}</p>
						<p class="p-sm">Pasajeros: {booking.passengers?.length ?? 0}</p>
						{#if booking.subtotalPrice != null}
							<p class="p-sm font-semibold">{(booking.subtotalPrice / 100).toFixed(2)} €</p>
						{/if}
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
