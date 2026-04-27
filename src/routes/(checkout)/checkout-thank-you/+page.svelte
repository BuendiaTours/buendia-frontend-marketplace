<script lang="ts">
	// Types
	import type { CartOrder } from '$lib/types';
	import type { PageData } from './$types';

	// Store
	import { shoppingCartStore } from '$lib/stores/shoppingCart.svelte';

	// Utils
	import { page } from '$app/state';

	// Components
	import ActivityCard from '$lib/components/marketplace/ActivityCard.svelte';
	import ActivityTips from '$lib/components/marketplace/checkout/ActivityTips.svelte';
	import Callout from '$lib/components/marketplace/Callout.svelte';
	import CheckoutSidebarResume from '$lib/components/marketplace/checkout/CheckoutSidebarResume.svelte';
	import ConfirmationHeroImg from '$lib/components/marketplace/checkout/ConfirmationHeroImg.svelte';
	import HubspotChat from '$lib/components/marketplace/HubspotChat.svelte';
	import PlpSwiper from '$lib/components/marketplace/plp/PlpSwiper.svelte';
	import ThankYouAccountCreate from '$lib/components/marketplace/checkout/ThankYouAccountCreate.svelte';
	import PdpCollectionPointsGroup from '$lib/components/marketplace/pdp/PdpCollectionPointsGroup.svelte';
	import CollectionPointMap from '$lib/components/marketplace/CollectionPointMap.svelte';
	import type { ActivityOptionPickupLocation } from '$lib/types';

	let { data }: { data: PageData } = $props();

	let order = $state<CartOrder | null>(null);
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	const orderId = $derived(page.url.searchParams.get('orderId'));

	const mockPickupLocations: ActivityOptionPickupLocation[] = [
		{
			pickupPointId: 'mock-1',
			kind: 'meeting_point',
			minutesBefore: 10,
			name: 'Puerta del Sol',
			address: 'Puerta del Sol, s/n',
			city: 'Madrid',
			postCode: '28013',
			countryCode: 'ES',
			location: { type: 'Point', coordinates: [-3.7037902, 40.4167754] }
		}
	];

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
						<a
							href={`/api/orders/${orderId}/calendar.ics`}
							class="e-button e-button-secondary relative"
							download="reserva.ics"
						>
							Añadir al calendario
						</a>
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

			<div class="mt-6">
				<PdpCollectionPointsGroup items={mockPickupLocations} />

				{#if mockPickupLocations[0]?.location}
					<CollectionPointMap
						coordinates={mockPickupLocations[0].location.coordinates}
						wrapperClass="mt-4"
					/>
				{/if}
			</div>

			<ThankYouAccountCreate
				title="Crea tu cuenta en buendía"
				description="Regístrate con un solo click. Tendrás acceso a la gestión de tu reserva desde tu Área personal y podrás disfrutar de ofertas exclusivas."
				buttonText="Registrarse"
				slug="/"
				wrapperClass="mt-6"
			/>

			<ThankYouAccountCreate
				title="Tu reserva está en tu área personal"
				description="Desde tu área personal podrás gestionar tu reserva siempre que quieras"
				buttonText="Ir a Área personal"
				buttonClass="e-button-secondary"
				slug="/"
				wrapperClass="mt-6"
			/>
		</div>

		<div class="col-sidebar">
			<CheckoutSidebarResume {order} />

			<HubspotChat wrapperClass="mt-4" />
		</div>
	</div>
</div>

<div class="wrapper mt-6">
	<PlpSwiper
		swiperOptions={{
			slidesPerView: 1.2,
			spaceBetween: 16,
			navigation: true,
			loop: false,
			breakpoints: {
				640: { slidesPerView: 2 },
				1024: { slidesPerView: 4 }
			}
		}}
		wrapperClass="mt-12 mb-12 sm:mt-16 sm:mb-16 lg:mt-24 lg:mb-24"
	>
		{#snippet header()}
			<div
				class="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-center sm:gap-6"
			>
				<h2 class="h2-editorial text-neutral-800">Otros también compraron</h2>
			</div>
		{/snippet}
		{#each data.activities as activity (activity.id)}
			<swiper-slide>
				<ActivityCard
					item={activity}
					wrapperClass="border-b border-solid border-neutral-200 pb-4 sm:p-3 sm:border sm:rounded-xl"
				/>
			</swiper-slide>
		{/each}
	</PlpSwiper>
</div>

<details class="mt-4">
	<summary>thank-you debug</summary>
	<pre>{JSON.stringify({ orderId, isLoading, error, order: $state.snapshot(order) }, null, 2)}</pre>
</details>
