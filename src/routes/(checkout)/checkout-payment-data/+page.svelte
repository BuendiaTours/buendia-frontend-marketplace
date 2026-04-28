<script lang="ts">
	// Store
	import { shoppingCartStore } from '$lib/stores/shoppingCart.svelte';

	// Utils
	import { goto } from '$app/navigation';

	$effect(() => {
		if (shoppingCartStore.orderId) shoppingCartStore.loadOrder();
	});

	// Components
	import CartExpiryCallout from '$lib/components/ShoppingCart/CartExpiryCallout.svelte';
	import CheckoutSidebarResume from '$lib/components/checkout/CheckoutSidebarResume.svelte';
	import Steps from '$lib/components/Steps.svelte';
	import TotalResume from '$lib/components/checkout/TotalResume.svelte';

	const isValid = $derived(!!shoppingCartStore.order?.bookings?.length);

	function simulatePaymentComplete() {
		goto(`/checkout-thank-you?orderId=${shoppingCartStore.orderId}`);
	}
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

				<h2 class="h2 mt-6">Métodos de pago</h2>

				<div class="mt-6 flex flex-col gap-4 rounded-xl border border-solid border-neutral-300 p-3">
					<!-- TODO: remove when real payment flow is implemented -->

					<TotalResume
						variant="IN_A_ROW"
						bookingCount={shoppingCartStore.bookingCount}
						totalAmount={shoppingCartStore.totalAmount}
						wrapperClass="mt-6"
					>
						{#snippet actions()}
							<button class="e-button mt-6" onclick={simulatePaymentComplete}>
								[DEV] Simular pago completado
							</button>
						{/snippet}
					</TotalResume>
				</div>
			{:else}
				<p class="p-base mt-6">No hay reservas para mostrar</p>
			{/if}
		</div>

		<div class="col-sidebar">
			<CheckoutSidebarResume />
		</div>
	</div>
</div>
