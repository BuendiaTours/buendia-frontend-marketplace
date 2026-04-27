<script lang="ts">
	// Types
	import type { CartOrder } from '$lib/types';

	// Store
	import { shoppingCartStore } from '$lib/stores/shoppingCart.svelte';

	// Utils
	import { page } from '$app/state';

	// Components
	import CheckoutSidebarResume from '$lib/components/marketplace/checkout/CheckoutSidebarResume.svelte';

	let order = $state<CartOrder | null>(null);
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	const orderId = $derived(page.url.searchParams.get('orderId'));

	$effect(() => {
		shoppingCartStore.clearShoppingCart();

		if (!orderId) return;

		isLoading = true;
		error = null;
		fetch(`/api/orders/${orderId}`)
			.then((r) => {
				if (!r.ok) throw new Error(`Error ${r.status} al cargar el pedido`);
				return r.json();
			})
			.then((data: CartOrder) => (order = data))
			.catch((e) => (error = e instanceof Error ? e.message : 'Error desconocido'))
			.finally(() => (isLoading = false));
	});
</script>

<div class="wrapper">
	<div class="page-grid gap-x-12">
		<div class="col-content">
			{#if isLoading}
				<p class="p-base mt-6">Cargando...</p>
			{:else if error}
				<p class="p-base mt-6 text-[oklch(0.55_0.2_25)]">{error}</p>
			{:else if order?.bookings?.length}
				<p class="h1">¡Gracias por tu compra!</p>
				<!-- Resumen de la compra -->
			{:else}
				<p class="p-base mt-6">No se encontró el pedido</p>
			{/if}
		</div>

		<div class="col-sidebar">
			<CheckoutSidebarResume />
		</div>
	</div>
</div>

<details class="mt-4">
	<summary>thank-you debug</summary>
	<pre>{JSON.stringify({ orderId, isLoading, error, order: $state.snapshot(order) }, null, 2)}</pre>
</details>
