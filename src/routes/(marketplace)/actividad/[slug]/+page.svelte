<script lang="ts">
	import type { PageData } from './$types';
	import { format } from 'date-fns';

	// Types
	import type { ActivityReviewParams, ActivityOption, AvailabilitySlot } from '$lib/types';
	import type { BndLightboxItem } from '$lib/types';

	// Reactivity
	import { SvelteURLSearchParams, SvelteMap } from 'svelte/reactivity';
	import { proxyApiRoutes } from '$lib/api/proxy-routes';

	// Actions
	import { clampText } from '$lib/actions/marketplace/clampText';
	import { trackClick } from '$lib/analytics';

	// Components
	import { ShoppingCart, SCActivityOption } from '$lib/components/marketplace/ShoppingCart';
	import { untrack } from 'svelte';
	import AccordionOnMobile from '$lib/components/marketplace/AccordionOnMobile.svelte';
	import ByBuendiaHighlights from '$lib/components/marketplace/ByBuendiaHighlights.svelte';
	import Conditions from '$lib/components/marketplace/Conditions.svelte';
	import FaqsCollapsable from '$lib/components/marketplace/FaqsCollapsable.svelte';
	import GallerySquareThumbs from '$lib/components/marketplace/GallerySquareThumbs.svelte';
	import HubspotChat from '$lib/components/marketplace/HubspotChat.svelte';
	import MapView from '$lib/components/marketplace/MapView.svelte';
	import PdpBrandBanner from '$lib/components/marketplace/pdp/PdpBrandBanner.svelte';
	import PdpCollectionPointsGroup from '$lib/components/marketplace/pdp/PdpCollectionPointsGroup.svelte';
	import PdpHeader from '$lib/components/marketplace/pdp/PdpHeader.svelte';
	import PdpHeadGallery from '$lib/components/marketplace/pdp/PdpHeadGallery.svelte';
	import PdpHighlights from '$lib/components/marketplace/pdp/PdpHighlights.svelte';
	import PdpItinerary from '$lib/components/marketplace/pdp/PdpItinerary.svelte';
	import PdpReviewsAverage from '$lib/components/marketplace/pdp/PdpReviewsAverage.svelte';
	import PdpSingleConditions from '$lib/components/marketplace/pdp/PdpSingleConditions.svelte';
	import ReviewCard from '$lib/components/marketplace/ReviewCard.svelte';
	import ReviewComment from '$lib/components/marketplace/ReviewComment.svelte';
	import Spacer from '$lib/components/marketplace/Spacer.svelte';

	// Lightbox
	import { ReviewsLayout } from '$lib/components/marketplace/BndLightbox';

	// Icons
	// import SvelteMarkdown from '@humanspeak/svelte-markdown';
	import { CustomMiniTick, CustomMiniCancel, VerifiedCheck } from '$lib/icons/Linear';

	// Checkout store / cart state
	import { createCheckout } from '$lib/stores/checkout.svelte';

	let { data }: { data: PageData } = $props();
	const activity = $derived(data.activity);

	// Estado cliente para reviews (sort + show more)
	let reviews = $state(data.reviews);
	let reviewsTotal = $state(data.reviewsTotal);
	let sortValue = $state<'recommended' | 'best' | 'recent' | 'worst'>('recommended');
	let currentPage = $state(1);
	let totalPages = $state(data.reviewsTotalPages);
	let isLoadingReviews = $state(false);
	let activeStars = $state<number[]>([]);

	const hasMoreReviews = $derived(currentPage < totalPages);
	const activityId = $derived(data.activity.id);
	const pickupPlaces = $derived(
		Array.from(
			new SvelteMap(
				data.activityOptions
					.flatMap((opt) => opt.pickupPlaces)
					.filter((p) => p.kind === 'PICKUP')
					.map((p) => [p.pickupPointId, p])
			).values()
		)
	);

	const checkout = untrack(() => createCheckout(data.activity.id));

	let selectedSlotId = $state<string | null>(null);

	function isSlotDisabled(slot: AvailabilitySlot): boolean {
		if (checkout.totalTickets === 0) return false;
		if (slot.availability - slot.reservedAvailability < checkout.totalTickets) return true;
		for (const [group, count] of checkout.counts) {
			if (count === 0) continue;
			const ticketItem = slot.tickets.find((t) => checkout.ticketIdToGroup.get(t.id) === group);
			if (!ticketItem) continue;
			if (ticketItem.stock - ticketItem.reservedStock < count) return true;
		}
		return false;
	}

	const allOptions = $derived(
		Object.values(
			checkout.selectedDateSlots.reduce<
				Record<string, { option: ActivityOption; slots: AvailabilitySlot[] }>
			>((acc, slot) => {
				const option = data.activityOptions.find((o) => o.id === slot.optionId);
				if (!option) return acc;
				if (!acc[slot.optionId]) acc[slot.optionId] = { option, slots: [] };
				acc[slot.optionId].slots.push(slot);
				return acc;
			}, {})
		)
	);

	const optionsWithSlots = $derived(
		allOptions.filter(({ slots }) => slots.some((s) => !isSlotDisabled(s)))
	);

	const optionsWithoutSlots = $derived(
		allOptions.filter(({ slots }) => slots.every((s) => isSlotDisabled(s)))
	);

	$effect(() => {
		const allSlots = optionsWithSlots.flatMap(({ slots }) => slots);
		const currentId = untrack(() => selectedSlotId);
		const currentIsValid = allSlots.some((s) => s.id === currentId && !isSlotDisabled(s));
		if (!currentIsValid) {
			selectedSlotId = allSlots.find((s) => !isSlotDisabled(s))?.id ?? null;
		}
	});

	const SORT_PARAMS: Record<string, ActivityReviewParams> = {
		recommended: {},
		best: { sort: 'averageRating', order: 'DESC' },
		worst: { sort: 'averageRating', order: 'ASC' },
		recent: { sort: 'createdAt', order: 'DESC' }
	};

	async function loadActivityReviews(params: ActivityReviewParams, append = false) {
		isLoadingReviews = true;
		try {
			const qs = new SvelteURLSearchParams();
			if (params.sort) qs.set('sort', params.sort);
			if (params.order) qs.set('order', params.order);
			if (params.page) qs.set('page', String(params.page));
			if (params.pageSize) qs.set('pageSize', String(params.pageSize));
			if (params.stars && params.stars.length > 0) {
				params.stars.forEach((s) => qs.append('stars', String(s)));
			}
			const result = await fetch(proxyApiRoutes.reviews.byActivity(activityId, qs)).then((r) =>
				r.json()
			);
			if (append) {
				reviews = [...reviews, ...result.data];
			} else {
				reviews = result.data;
			}
			currentPage = result.pagination.page;
			totalPages = result.pagination.totalPages;
			reviewsTotal = result.pagination.total;
		} finally {
			isLoadingReviews = false;
		}
	}

	async function handleReviewSortChange(value: string) {
		sortValue = value as typeof sortValue;
		currentPage = 1;
		trackClick('pdp_click', value, 'opiniones');
		await loadActivityReviews({ ...(SORT_PARAMS[value] ?? {}), stars: activeStars });
	}

	async function handleShowMore() {
		trackClick('pdp_click', 'mostrar mas', 'opiniones');
		await loadActivityReviews(
			{ ...SORT_PARAMS[sortValue], page: currentPage + 1, stars: activeStars },
			true
		);
	}

	let hasTrackedOpinionesScroll = false;

	const reviewItems = $derived<BndLightboxItem[]>(
		reviews.flatMap((review, reviewIdx) =>
			(review.attachments ?? []).map((att) => ({
				src: att.url.value,
				alt: `Foto de ${review.user ?? 'Anónimo'}`,
				meta: {
					user: review.user ?? 'Anónimo',
					rating: review.averageRating,
					content: review.content,
					date: review.createdAt?.split('T')[0] ?? '',
					reviewIndex: reviewIdx
				}
			}))
		)
	);
</script>

<div class="wrapper">
	<!-- pdp-head-gallery -->
	<PdpHeadGallery items={activity.multimedias} />

	<div class="page-grid">
		<div class="col-content">
			<!-- pdp-header -->
			<PdpHeader
				dataBreadcrumbs={data.breadcrumbs}
				title={activity.title}
				reviewsCount={reviewItems.length}
				wrapperClass="mt-5"
			/>

			<Spacer wrapperClass="mt-6 mb-8" />

			{#if checkout.selectedDate && optionsWithSlots.length > 0}
				<p class="h2">{optionsWithSlots.length} opciones disponibles</p>
				<p>Todas las opciones incluyen las mismas condiciones by buendía</p>
				<div class="sc-activity-options mt-6">
					{#each optionsWithSlots as { option, slots } (option.id)}
						<SCActivityOption {option} {slots} bind:selectedSlotId />
					{/each}
				</div>
			{/if}

			{#if checkout.selectedDate && optionsWithoutSlots.length > 0}
				<p class="h2 mt-6">Sin disponibilidad en tus fechas</p>
				<div class="sc-activity-options mt-6">
					{#each optionsWithoutSlots as { option, slots } (option.id)}
						<SCActivityOption {option} {slots} bind:selectedSlotId />
					{/each}
				</div>
			{/if}

			{#if checkout.selectedDate && (optionsWithSlots.length > 0 || optionsWithoutSlots.length > 0)}
				<Spacer wrapperClass="mt-6 mb-8" />
			{/if}

			<!-- highlights -->
			{#if activity.highlights && activity.highlights.length > 0}
				<PdpHighlights items={activity.highlights} wrapperClass="" />
				<Spacer wrapperClass="mt-8 mb-6" />
			{/if}

			<!-- pdp-by-buendia-banner -->

			<ByBuendiaHighlights
				data={{
					title: 'Plan by buendía',
					description: 'Lo organizamos nosotros, por eso te damos las mejores condiciones',
					items: [
						{
							icon: 'CalendarCheck',
							title: 'Cancelación gratuita',
							description: 'Cancela sin coste hasta el incio de la actividad'
						},
						{
							icon: 'MoneyBack',
							title: 'Garantía de reembolso',
							description: 'Si no te gusta, te devolvemos el dinero. Sin explicaciones'
						},
						{
							icon: 'ChatRoundLine',
							title: 'Soporte humano antes, durante y después',
							description: 'Chat y teléfono para ayudarte en cualquier momento del proceso'
						}
					],
					link: {
						text: 'Saber más',
						src: 'https://google.es'
					}
				}}
				wrapperClass="mt-6 mb-6 sm:bg-[url(/marketplace/BrandMark.svg)]"
				onlinkclick={() => trackClick('pdp_click', 'saber mas', 'plan bybuendia')}
			/>

			<Spacer wrapperClass="mt-8 mb-6" />

			<!-- pdp-reviews-featured -->
			{#if data.reviews && data.reviews.length > 1}
				<div class="pdp-reviews-featured">
					<p class="pdp-reviews-featured__title h2 mb-4">Opiniones destacadas</p>
					<div
						class="pdp-reviews-featured__reviews flex snap-x snap-mandatory gap-4 overflow-x-auto sm:overflow-visible"
						onscroll={() => {
							if (!hasTrackedOpinionesScroll) {
								hasTrackedOpinionesScroll = true;
								trackClick('pdp_click', 'opiniones destacadas scroll', 'opiniones');
							}
						}}
					>
						{#each data.reviews.slice(0, 2) as review (review.id)}
							<div class="w-5/6 flex-none snap-start snap-always sm:w-auto sm:flex-1">
								<ReviewCard
									name={review.user || 'Anónimo'}
									desc={review.createdAt
										? format(new Date(review.createdAt), 'dd/MM/yyyy')
										: undefined}
									text={review.content}
									rating={review.averageRating}
									lines={3}
									wrapperClass="p-6 border border-[var(--color-border-default)] rounded-lg h-full"
									{...review}
								/>
							</div>
						{/each}
					</div>
					<a
						href="#reviews"
						class="p-base mt-4 block cursor-pointer font-bold text-neutral-800 underline underline-offset-8"
						onclick={() => trackClick('pdp_click', 'opiniones top scroll', 'opiniones')}
						>Ver todas las opiniones</a
					>
				</div>

				<Spacer />
			{/if}

			{#if pickupPlaces.length > 0}
				<PdpCollectionPointsGroup items={pickupPlaces} />
				<Spacer />
			{/if}

			<PdpItinerary title={activity.stagesTitle} items={activity.stages} wrapperClass="" />

			<MapView
				wrapperClass="mt-8"
				onclick={() => trackClick('pdp_click', 'ver mapa', 'itinerario')}
			/>

			<Spacer />

			<!-- conditions -->
			{#if activity.willDoing && activity.willDoing.length > 0}
				<p class="h2 mt-4 mb-2 lg:mt-6">Qué harás</p>
				<ul class="pdp-willdoing list-inside list-disc space-y-0.5 pl-2">
					{#each activity.willDoing as item, i (i)}
						<li>{item}</li>
					{/each}
				</ul>
			{/if}

			<Spacer />

			<!-- Description -->
			{#if activity.descriptionFull}
				<AccordionOnMobile open={true} contentClass="mt-6">
					{#snippet summary()}
						<h2 class="h2">Descripción de la excursión</h2>
					{/snippet}
					<p use:clampText={{ lines: 3, mode: 'text' }}>{activity.descriptionFull}</p>
					<!-- <SvelteMarkdown source={activity.descriptionFull} /> -->
				</AccordionOnMobile>
				<Spacer wrapperClass="mt-6 mb-8" />
			{/if}

			<!-- conditions -->
			{#if activity.conditions && activity.conditions.length > 0}
				<p class="h2 pb-4">Condiciones</p>
				<div class="pdp-conditions flex flex-col gap-4">
					{#each activity.conditions as condition (condition.id)}
						<Conditions style={condition.style} items={condition.items} />
					{/each}
				</div>
			{/if}

			<!-- conditions -->
			{#if activity.infoImportant}
				<Conditions
					style="important"
					items={[
						{
							id: 'important-info',
							icon: 'InfoCircle',
							title: 'Información importante',
							description: activity.infoImportant
						}
					]}
					wrapperClass="mt-4"
				/>
				<Spacer />
			{/if}

			<!-- pdp-included-excluded -->
			{#if (activity.included && activity.included.length > 0) || (activity.excluded && activity.excluded.length > 0)}
				<h2 class="h2 mt-4 mb-4 lg:mt-6">Qué incluye esta excursión</h2>
				<ul class="pdp-list pdp-included-excluded space-y-1">
					{#each activity.included ?? [] as item, i (i)}
						<li class="flex items-start gap-2">
							<CustomMiniTick class="mt-0.5 size-5 shrink-0 text-green-600" />
							<span>{item.description}</span>
						</li>
					{/each}
					{#each activity.excluded ?? [] as item, i (i)}
						<li class="flex items-start gap-2">
							<CustomMiniCancel class="mt-0.5 size-5 shrink-0 text-red-500" />
							<span>{item.description}</span>
						</li>
					{/each}
				</ul>
				<Spacer />
			{/if}

			<!-- Not Suitable For -->
			{#if activity.notSuitableFor && activity.notSuitableFor.length > 0}
				<p class="h2 mt-4 mb-2 lg:mt-6">No apto para</p>
				<ul class="pdp-willdoing list-inside list-disc space-y-0.5 pl-2">
					{#each activity.notSuitableFor as item, i (i)}
						<li>{item.description}</li>
					{/each}
				</ul>
				<Spacer />
			{/if}

			<!-- Pets Allowed -->
			{#if activity.petsAllowed}
				<p class="h2 mt-4 mb-2 lg:mt-6">Mascotas</p>
				<ul class="pdp-willdoing list-inside list-disc space-y-0.5 pl-2">
					<li>
						<span
							>{activity.petsAllowed.allowed === 'YES'
								? 'Esta actividad permite mascotas.'
								: 'Esta actividad no permite mascotas.'}
						</span>
						{#if activity.petsAllowed.description}
							<p class="text-gray-600">{activity.petsAllowed.description}</p>
						{/if}
					</li>
				</ul>

				<Spacer />
			{/if}

			<!-- faqs -->
			<FaqsCollapsable
				title={`Preguntas frecuentes sobre esta excursión desde ${activity.destinations?.[0]?.name || '<DESTINO?>'}`}
				faqs={activity.faqs}
			/>

			<Spacer />

			<!-- pdp-single-conditions -->
			<PdpSingleConditions
				data={{
					icon: 'HandHeart',
					title: 'Consejo by buendía',
					description:
						'Si quieres disfrutar al máximo de tu tiempo libre, en Brujas aprovecha para recorrer el Muelle del Rosario y el Beguinaje, dos lugares menos transitados, pero de una belleza única. Y si visitas en invierno, lleva ropa de abrigo.'
				}}
				wrapperClass="mt-4 mb-4 lg:mt-8 lg:mb-8"
			/>

			<Spacer />

			<div class="pdp-review-gallery mb-8">
				<h2 class="h2">Opiniones de {activity.title}</h2>

				{#if reviewItems?.length > 0}
					<p class="p-base text-bold mt-4">Fotos de nuestros viajeros</p>

					<GallerySquareThumbs
						items={reviewItems}
						visibleCount={3}
						thumbClass="flex-1"
						wrapperClass="mt-4 gap-4 @max-[400px]:flex-wrap @max-[400px]:justify-center"
						showCount={true}
						categoryId="reviews"
						categoryLabel="Fotos de viajeros"
						layoutComponent={ReviewsLayout}
						galleryLocation="user gallery"
					/>
				{/if}
			</div>

			<p class="h4 mb-4">Valoración</p>
			{#if data.reviewsStats}
				<PdpReviewsAverage
					stats={data.reviewsStats}
					activityTitle={activity.title}
					onStarsChange={async (stars) => {
						activeStars = stars;
						currentPage = 1;
						await loadActivityReviews({ ...SORT_PARAMS[sortValue], stars });
					}}
					wrapperClass="mb-8"
				/>
			{/if}

			<!-- Reviews -->
			<div class="pdp-review-list" id="reviews">
				<div class="pdp-review-list__header mb-4 flex flex-row items-center justify-between gap-2">
					<div class="flex items-center gap-1">
						<VerifiedCheck class="size-5" />
						<p class="p-base whitespace-nowrap">Opiniones verificadas ({reviewsTotal})</p>
					</div>
					<div class="flex items-center gap-3">
						<p class="p-base hidden whitespace-nowrap sm:block">Ordenar por</p>
						<select
							class="select"
							aria-label="Seleccionar orden"
							value={sortValue}
							onchange={(e) => handleReviewSortChange(e.currentTarget.value)}
						>
							<option value="recommended">Recomendado</option>
							<option value="best">Mejor valoración</option>
							<option value="worst">Peor valoración</option>
							<option value="recent">Más recientes</option>
						</select>
					</div>
				</div>
				<ul id="pdp-review-list__reviews" class="pdp-review-list__reviews space-y-6">
					{#if reviews.length > 0}
						{#each reviews as review (review.id)}
							<li class="border-b border-[var(--color-border-default)] pb-6">
								<ReviewCard
									name={review.user || 'Anónimo'}
									desc={review.createdAt
										? format(new Date(review.createdAt), 'dd/MM/yyyy')
										: undefined}
									text={review.content}
									rating={review.averageRating}
									lines={4}
									{...review}
								/>

								{#if review.attachments && review.attachments.length > 0}
									<GallerySquareThumbs
										items={review.attachments.map((att) => ({ src: att.url.value }))}
										visibleCount={5}
										categoryId="review-{review.id}"
										wrapperClass="mt-4 gap-2 flex-wrap"
										thumbClass="w-[calc(50%-4px)] sm:w-34"
									/>
								{/if}

								{#if review.replies && review.replies.length > 0}
									<div class="mt-6 space-y-2">
										{#each review.replies as reply (reply.id)}
											<ReviewComment {reply} />
										{/each}
									</div>
								{/if}
							</li>
						{/each}
					{:else}
						<li class="text-gray-600">No hay reviews para esta actividad.</li>
					{/if}
				</ul>
				{#if hasMoreReviews}
					<div class="pdp-review-list__footer-actions mt-6 flex justify-center sm:justify-start">
						<button
							type="button"
							class="e-button e-button-secondary"
							onclick={handleShowMore}
							disabled={isLoadingReviews}
						>
							{isLoadingReviews ? 'Cargando...' : 'Mostrar más'}
						</button>
					</div>
				{/if}
			</div>
		</div>

		<div class="col-sidebar pt-6">
			<div class="carrito sticky top-0">
				<ShoppingCart activityOptions={data.activityOptions} {activityId} />

				<HubspotChat wrapperClass="mt-4" />
			</div>
		</div>
	</div>

	<div class="pdp-related-pans mt-16">
		<p class="h2 mb-4">Planes relacionados</p>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<div class="rounded-lg border border-gray-200 bg-white p-6">
				<p class="font-semibold text-gray-800">Plan 1</p>
				<p class="text-gray-600">Descripción breve del plan relacionada.</p>
			</div>
			<div class="rounded-lg border border-gray-200 bg-white p-6">
				<p class="font-semibold text-gray-800">Plan 2</p>
				<p class="text-gray-600">Descripción breve del plan relacionada.</p>
			</div>
			<div class="rounded-lg border border-gray-200 bg-white p-6">
				<p class="font-semibold text-gray-800">Plan 3</p>
				<p class="text-gray-600">Descripción breve del plan relacionada.</p>
			</div>
			<div class="rounded-lg border border-gray-200 bg-white p-6">
				<p class="font-semibold text-gray-800">Plan 4</p>
				<p class="text-gray-600">Descripción breve del plan relacionada.</p>
			</div>
		</div>
	</div>

	<!-- pdp-brand-banner -->
	<PdpBrandBanner
		title="¿Sabías qué?"
		description="Brujas y Gante fueron dos de las ciudades más ricas de Europa durante la Edad Media gracias al comercio textil. Sus centros históricos han conservado casi intacto el trazado urbano medieval, lo que les ha valido el reconocimiento como Patrimonio de la Humanidad por la UNESCO."
		image="https://dummyimage.com/666x666/ffffff/000000.jpg"
		imageAlt="Imagén de prueba"
		wrapperClass="my-16"
	/>
</div>
