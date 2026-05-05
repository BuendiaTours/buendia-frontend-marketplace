<script lang="ts">
	import { loadStripe } from '@stripe/stripe-js';
	import type { Stripe, StripeElements } from '@stripe/stripe-js';
	import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$env/static/public';
	import { onMount } from 'svelte';

	// Store
	import { shoppingCartStore } from '$lib/stores/shoppingCart.svelte';

	$effect(() => {
		if (shoppingCartStore.orderId) shoppingCartStore.loadOrder();
	});

	// Components
	import CartExpiryCallout from '$lib/components/ShoppingCart/CartExpiryCallout.svelte';
	import CheckoutSidebarResume from '$lib/components/Checkout/CheckoutSidebarResume.svelte';
	import Steps from '$lib/components/Steps.svelte';
	import TotalResume from '$lib/components/Checkout/TotalResume.svelte';

	const isValid = $derived(!!shoppingCartStore.order?.bookings?.length);

	let paymentElementContainer: HTMLDivElement | null = $state(null);
	let isLoading = $state(true);
	let isProcessing = $state(false);
	let errorMessage = $state<string | null>(null);

	let stripeInstance: Stripe | null = null;
	let elements: StripeElements | null = null;

	onMount(async () => {
		stripeInstance = await loadStripe(PUBLIC_STRIPE_PUBLISHABLE_KEY);
		if (!stripeInstance) return;

		const res = await fetch('/api/stripe/payment-intent', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				amount: shoppingCartStore.totalAmount,
				currency: 'eur',
				orderId: shoppingCartStore.orderId
			})
		});

		if (!res.ok) {
			errorMessage = 'No se pudo iniciar el pago. Inténtalo de nuevo.';
			isLoading = false;
			return;
		}

		const { clientSecret } = await res.json();

		elements = stripeInstance.elements({ clientSecret, locale: 'es' });
		const paymentElement = elements.create('payment');
		paymentElement.on('ready', () => (isLoading = false));
		if (paymentElementContainer) paymentElement.mount(paymentElementContainer);
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!stripeInstance || !elements) return;

		isProcessing = true;
		errorMessage = null;

		const { error } = await stripeInstance.confirmPayment({
			elements,
			confirmParams: {
				return_url: `${window.location.origin}/checkout-thank-you?orderId=${shoppingCartStore.orderId}`
			}
		});

		if (error) {
			errorMessage = error.message ?? 'Error al procesar el pago.';
			isProcessing = false;
		}
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

				<div class="mt-6 rounded-xl border border-solid border-neutral-300 p-6">
					<TotalResume
						variant="IN_A_ROW"
						bookingCount={shoppingCartStore.bookingCount}
						totalAmount={shoppingCartStore.totalAmount}
						wrapperClass="mb-6"
					/>

					<form onsubmit={handleSubmit}>
						{#if isLoading}
							<div class="flex items-center justify-center py-8">
								<span class="text-neutral-500">Cargando métodos de pago...</span>
							</div>
						{/if}

						<div bind:this={paymentElementContainer} class:hidden={isLoading}></div>

						{#if errorMessage}
							<p class="p-sm mt-4 text-red-600">{errorMessage}</p>
						{/if}

						<button type="submit" class="e-button mt-6 w-full" disabled={isLoading || isProcessing}>
							{isProcessing ? 'Procesando...' : 'Pagar ahora'}
						</button>
					</form>
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
