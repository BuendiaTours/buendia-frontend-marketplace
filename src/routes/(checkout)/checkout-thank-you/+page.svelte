<script lang="ts">
	// Types
	import type { CartOrder } from '$lib/types';

	// Store
	import { shoppingCartStore } from '$lib/stores/shoppingCart.svelte';

	// Utils
	import { page } from '$app/state';

	// Components
	import CheckoutSidebarResume from '$lib/components/marketplace/checkout/CheckoutSidebarResume.svelte';
	import ConfirmationHeroImg from '$lib/components/marketplace/checkout/ConfirmationHeroImg.svelte';
	import HubspotChat from '$lib/components/marketplace/HubspotChat.svelte';
	import ActivityTips from '$lib/components/marketplace/checkout/ActivityTips.svelte';
	import Callout from '$lib/components/marketplace/Callout.svelte';

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
				<ConfirmationHeroImg
					title="¡Todo listo para <DESTINATION>"
					subtitle={`Reserva confirmada: ${orderId}`}
					imgSrc="https://picsum.photos/600/338"
				>
					{#snippet actions()}
						<button type="button" class="e-button e-button-secondary relative">
							Añadir al calendario
						</button>
					{/snippet}
				</ConfirmationHeroImg>

				<Callout
					style="editorial-high"
					items={[
						{
							icon: 'InfoCircle',
							title: 'Todos los detalles en tu correo',
							description: `Te enviaremos toda la información de tu reserva, incluyendo el pase y el punto de encuentro exacto a <span class="font-bold">${order?.contactEmail ?? 'tu correo electrónico'}</span>`
						}
					]}
					wrapperClass="mt-6"
				/>

				<h2 class="h2 mt-6 mb-5 text-neutral-800 lg:mb-6">Consejos prácticos para el Free tour</h2>

				<ActivityTips
					items={[
						{
							icon: 'HandHeart',
							title: 'Tú pones el precio',
							description:
								'Tú decides cuánto pagar. Para orientarte: 10-15 € por persona es lo que suele darse.'
						},
						{
							icon: 'WatchRound',
							title: 'Llega con margen',
							description:
								'Con 10 minutos de antelación tendrás tiempo de localizar al guía sin agobios.'
						},
						{
							icon: 'CalendarCheck',
							title: 'Si algo cambia, avísanos',
							description:
								'Aunque los free tours no requieren pago por adelantado, si no puedes asistir, te pedimos que liberes tu plaza, así otras personas podrán disfrutar de la experiencia si tú no puedes ir.'
						}
					]}
				/>
			{:else}
				<p class="p-base mt-6">No se encontró el pedido</p>
			{/if}
		</div>

		<div class="col-sidebar">
			<CheckoutSidebarResume />

			<HubspotChat wrapperClass="mt-4" />
		</div>
	</div>
</div>

<details class="mt-4">
	<summary>thank-you debug</summary>
	<pre>{JSON.stringify({ orderId, isLoading, error, order: $state.snapshot(order) }, null, 2)}</pre>
</details>
