<script lang="ts">
	// Store
	import { shoppingCartStore } from '$lib/stores/shoppingCart.svelte';

	// Components
	import CheckoutSidebarResume from '$lib/components/marketplace/checkout/CheckoutSidebarResume.svelte';

	const isValid = $derived(!!shoppingCartStore.order?.bookings?.length);
</script>

<div class="wrapper">
	<div class="page-grid gap-x-12">
		<div class="col-content">
			{#if shoppingCartStore.order?.bookings?.length}
				// Resumen de la compra
			{:else}
				<p class="p-base mt-6">No hay reservas para mostrar</p>
			{/if}
		</div>

		<div class="col-sidebar">
			<CheckoutSidebarResume />
		</div>
	</div>
</div>

<details class="mt-4">
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
