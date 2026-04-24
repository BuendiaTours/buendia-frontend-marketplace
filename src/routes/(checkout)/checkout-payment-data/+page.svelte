<script lang="ts">
	// Store
	import { shoppingCartStore } from '$lib/stores/shoppingCart.svelte';

	// Components
	import CartExpiryCallout from '$lib/components/marketplace/ShoppingCart/CartExpiryCallout.svelte';
	import CheckoutSidebarResume from '$lib/components/marketplace/checkout/CheckoutSidebarResume.svelte';
	import Steps from '$lib/components/marketplace/Steps.svelte';

	const isValid = $derived(!!shoppingCartStore.order?.bookings?.length);
</script>

<div class="wrapper">
	<div class="page-grid gap-x-12">
		<div class="col-content">
			{#if shoppingCartStore.order?.bookings?.length}
				<CartExpiryCallout />

				<Steps
					wrapperClass="mt-6"
					items={[
						{
							text: 'Datos personales',
							url: '/checkout-personal-data',
							active: true
						},
						{
							text: 'Datos de pago',
							url: '/checkout-payment-data',
							active: true
						}
					]}
				/>
			{:else}
				<p class="p-base mt-6">No hay reservas para mostrar</p>
			{/if}
		</div>

		<div class="col-sidebar">
			<CheckoutSidebarResume />
		</div>
	</div>
</div>
