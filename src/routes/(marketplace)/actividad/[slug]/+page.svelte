<script lang="ts">
	import type { PageData } from './$types';
	import { format } from 'date-fns';
	import { untrack } from 'svelte';

	// Types
	import type { ActivityReviewParams, ActivityOption, AvailabilitySlot } from '$lib/types';
	import type { BndLightboxItem } from '$lib/types';

	// Reactivity
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { proxyApiRoutes } from '$lib/api/proxy-routes';

	// Actions
	import { clampText } from '$lib/actions/clampText';
	import { trackClick } from '$lib/analytics';
	import * as m from '$paraglide/messages';
	import { formatDuration } from '$lib/utils/duration';
	import { formatGuideHighlight, formatAudioHighlight } from '$lib/utils/languages';

	// Components
	import AccordionOnMobile from '$lib/components/AccordionOnMobile.svelte';
	import ByBuendiaHighlights from '$lib/components/ByBuendiaHighlights.svelte';
	import Callout from '$lib/components/Callout.svelte';
	import FaqsCollapsable from '$lib/components/FaqsCollapsable.svelte';
	import GallerySquareThumbs from '$lib/components/GallerySquareThumbs.svelte';
	import HubspotChat from '$lib/components/HubspotChat.svelte';
	import MapView from '$lib/components/MapView.svelte';
	import PdpBrandBanner from '$lib/components/pdp/PdpBrandBanner.svelte';
	import PdpCollectionPointsGroup from '$lib/components/pdp/PdpCollectionPointsGroup.svelte';
	import PdpHeader from '$lib/components/pdp/PdpHeader.svelte';
	import PdpHeadGallery from '$lib/components/pdp/PdpHeadGallery.svelte';
	import PdpHighlights from '$lib/components/pdp/PdpHighlights.svelte';
	import PdpItinerary from '$lib/components/pdp/PdpItinerary.svelte';
	import PdpReviewsAverage from '$lib/components/pdp/PdpReviewsAverage.svelte';
	import PdpSingleConditions from '$lib/components/pdp/PdpSingleConditions.svelte';
	import ReviewCard from '$lib/components/ReviewCard.svelte';
	import ReviewComment from '$lib/components/ReviewComment.svelte';
	import Spacer from '$lib/components/Spacer.svelte';
	import CheckoutActivityOption from '$lib/components/Checkout/CheckoutActivityOption.svelte';

	// Lightbox
	import { ReviewsLayout } from '$lib/components/BndLightbox';

	// Icons
	import SvelteMarkdown from '@humanspeak/svelte-markdown';
	import { CustomMiniTick, CustomMiniCancel, VerifiedCheck } from '$lib/icons/Linear';

	// Checkout store / cart state
	import { Checkout } from '$lib/components/Checkout';
	import { createCheckout } from '$lib/stores/checkout.svelte';

	// Translations
	const msgs = m as unknown as Record<string, () => string>;

	// ── Data ─────────────────────────────────────────────────────────────────
	let { data }: { data: PageData } = $props();
	const activity = $derived(data.activity);
	const activityId = $derived(data.activity.id);
	const isOwned = $derived(data.activity.supplier?.source === 'OWNED');

	const conditionsItems = $derived([
		...(activity.bookingCutOff === 0
			? [
					{
						icon: 'CalendarCheck',
						title: 'Cancelación gratuita hasta el inicio de la actividad',
						description:
							'Puedes cancelar en cualquier momento antes del inicio de la actividad. Si llegas tarde o no te presentas, no se obtiene ningún reembolso.'
					}
				]
			: []),
		...(activity.bookingCutOff != null && activity.bookingCutOff > 0
			? [
					{
						icon: 'CalendarCheck',
						title: `Cancelación gratuita hasta ${activity.bookingCutOff}h antes`,
						description: `Puedes cancelar en cualquier momento hasta ${activity.bookingCutOff}hh antes del inicio de la actividad, después de ese periodo no se obtiene ningún reembolso.`
					}
				]
			: []),
		...(activity.bookingCutOff === null
			? [
					{
						icon: 'CalendarCheck',
						title: 'No reembolsable',
						description: `Esta actividad es no reembolsable, si cancelas la reserva o no te presentas no se efectuará ningún reembolso.`
					}
				]
			: []),
		...(isOwned
			? [
					{
						icon: 'MoneyBack',
						title: 'Garantía de reembolso',
						description: 'Si no quedas satisfecho, te devolvemos tu dinero.'
					}
				]
			: [])
	]);

	// ── Checkout & opciones ───────────────────────────────────────────────────
	const checkout = untrack(() => createCheckout(data.activity.id));

	let selectedSlotId = $state<string | null>(null);

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
		allOptions.filter(({ slots }) => slots.some((s) => !checkout.isSlotDisabled(s)))
	);

	const optionsWithoutSlots = $derived(
		allOptions.filter(({ slots }) => slots.every((s) => checkout.isSlotDisabled(s)))
	);

	$effect(() => {
		const allSlots = optionsWithSlots.flatMap(({ slots }) => slots);
		const currentId = untrack(() => selectedSlotId);
		const currentIsValid = allSlots.some((s) => s.id === currentId && !checkout.isSlotDisabled(s));
		if (!currentIsValid) {
			selectedSlotId = allSlots.find((s) => !checkout.isSlotDisabled(s))?.id ?? null;
		}
	});

	// ── Reviews ───────────────────────────────────────────────────────────────
	let reviews = $state(data.reviews);
	let reviewsTotal = $state(data.reviewsTotal);
	let sortValue = $state<'recommended' | 'best' | 'recent' | 'worst'>('recommended');
	let isLoadingReviews = $state(false);
	let activeStars = $state<number[]>([]);
	const hasMoreReviews = $derived(reviews.length < reviewsTotal);

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
			if (params.skip !== undefined) qs.set('skip', String(params.skip));
			if (params.limit) qs.set('limit', String(params.limit));
			if (params.averageRatings && params.averageRatings.length > 0) {
				params.averageRatings.forEach((s) => qs.append('averageRatings', String(s)));
			}
			const result = await fetch(proxyApiRoutes.reviews.byActivity(activityId, qs)).then((r) =>
				r.json()
			);
			if (append) {
				reviews = [...reviews, ...result.data];
			} else {
				reviews = result.data;
			}
			reviewsTotal = result.total;
		} finally {
			isLoadingReviews = false;
		}
	}

	async function handleReviewSortChange(value: string) {
		sortValue = value as typeof sortValue;
		trackClick('pdp_click', value, 'opiniones');
		await loadActivityReviews({
			...(SORT_PARAMS[value] ?? {}),
			skip: 0,
			limit: data.reviewsLimit,
			averageRatings: activeStars
		});
	}

	async function handleShowMore() {
		trackClick('pdp_click', 'mostrar mas', 'opiniones');
		await loadActivityReviews(
			{
				...SORT_PARAMS[sortValue],
				skip: reviews.length,
				limit: data.reviewsLimit,
				averageRatings: activeStars
			},
			true
		);
	}

	// ── Galería ───────────────────────────────────────────────────────────────
	let hasTrackedOpinionesScroll = false;

	const reviewItems = $derived<BndLightboxItem[]>(
		(data.reviewAttachments ?? []).map((att) => ({
			src: att.url,
			alt: 'Foto de viajero',
			meta: { reviewId: att.reviewId }
		}))
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
				reviewsTotal={activity.reviewsTotal}
				reviewsAvg={activity.reviewsAvg}
				wrapperClass="mt-5"
			/>

			<Spacer wrapperClass="mt-6 mb-8" />

			{#if checkout.selectedDate}
				{#if optionsWithSlots.length > 0}
					<p class="h2">
						{optionsWithSlots.length}
						{optionsWithSlots.length === 1 ? 'opción disponible' : 'opciones disponibles'}
					</p>
					<p class="p-lg mt-2 text-neutral-700">
						Todas las opciones incluyen las mismas condiciones by buendía.
					</p>
					<CheckoutActivityOption
						options={optionsWithSlots}
						bind:selectedSlotId
						wrapperClass="mt-6"
					/>
				{/if}
				{#if optionsWithoutSlots.length > 0}
					<p class="h2 mt-6">Sin disponibilidad en tus fechas</p>
					<CheckoutActivityOption
						options={optionsWithoutSlots}
						bind:selectedSlotId
						wrapperClass="mt-6"
					/>
				{/if}
				{#if optionsWithSlots.length > 0 || optionsWithoutSlots.length > 0}
					<Spacer wrapperClass="mt-6 mb-8" />
				{/if}
			{/if}

			<!-- highlights -->
			{#if activity.highlights && activity.highlights.length > 0}
				<PdpHighlights
					items={[
						...(activity.durationMin || activity.durationMax
							? [
									{
										icon: 'ClockCircle',
										text: formatDuration(activity.durationMin, activity.durationMax)
									}
								]
							: []),
						...(activity.languages && activity.languages.length > 0
							? [
									{
										icon: 'Guide',
										text: formatGuideHighlight(activity.guideKind, activity.languages)
									}
								]
							: []),
						...(activity.audios && activity.audios.length > 0
							? [
									{
										icon: 'HeadphonesRound',
										text: formatAudioHighlight(activity.audios)
									}
								]
							: []),
						{
							icon: 'BillCheck',
							text: 'No se requiere pago de entradas o gastos adicionales'
						},
						...(activity.difficult && msgs[`enum_activityDifficult_${activity.difficult}`]
							? [
									{
										icon: 'Activity1',
										text: m.activities_pdp_highlight_difficulty({
											level: activity.difficult,
											name: msgs[`enum_activityDifficult_${activity.difficult}`]()
										}),
										itsLevel: true
									}
								]
							: [])
					]}
					wrapperClass=""
				/>
			{/if}

			{#if isOwned}
				<!-- pdp-by-buendia-banner -->
				<Spacer wrapperClass="mt-8 mb-6" />

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
			{/if}

			{#if activity.reviewsFeatured && activity.reviewsFeatured.length > 0}
				<Spacer wrapperClass="mt-8 mb-6" />

				<!-- pdp-reviews-featured -->
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
						{#each activity.reviewsFeatured as review (review.id)}
							<div class="w-5/6 flex-none snap-start snap-always sm:w-auto sm:flex-1">
								<ReviewCard
									name={review.user || 'Anónimo'}
									desc={review.createdAt
										? format(new Date(review.createdAt), 'dd/MM/yyyy')
										: undefined}
									text={review.content}
									rating={review.rating}
									lines={3}
									wrapperClass="p-6 border border-[var(--color-border-default)] rounded-lg h-full"
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
			{/if}

			{#if activity.meetingPoint}
				<Spacer />
				<PdpCollectionPointsGroup items={[activity.meetingPoint]} />
			{/if}

			{#if activity.stages && activity.stages.length > 0}
				<Spacer />
				<PdpItinerary title={activity.stagesTitle} items={activity.stages} wrapperClass="" />
				<MapView
					items={activity.stages}
					wrapperClass="mt-8"
					onclick={() => trackClick('pdp_click', 'ver mapa', 'itinerario')}
				/>
			{/if}

			{#if activity.willDoing && activity.willDoing.length > 0}
				<Spacer />
				<!-- willDoing -->
				<p class="h2 mt-4 mb-2 lg:mt-6">Qué harás</p>
				<ul class="pdp-willdoing list-inside list-disc space-y-0.5 pl-2">
					{#each activity.willDoing as item, i (i)}
						<li>{item}</li>
					{/each}
				</ul>
			{/if}

			{#if activity.descriptionFull}
				<Spacer />
				<!-- Description -->
				<AccordionOnMobile open={true} contentClass="mt-6">
					{#snippet summary()}
						<h2 class="h2">Descripción de la excursión</h2>
					{/snippet}
					<!-- p use:clampText={{ lines: 3, mode: 'text' }}>{activity.descriptionFull}</p -->
					<SvelteMarkdown source={activity.descriptionFull} />
				</AccordionOnMobile>
			{/if}

			{#if conditionsItems && conditionsItems.length > 0}
				<Spacer wrapperClass="mt-6 mb-8" />
				<!-- conditions -->
				<p class="h2 pb-4">Condiciones</p>
				<Callout style="success-high" items={conditionsItems} />
			{/if}

			<!-- conditions -->
			{#if activity.infoImportant}
				<Callout
					style="warning"
					items={[
						{
							icon: 'InfoCircle',
							title: 'Información importante',
							description: activity.infoImportant
						}
					]}
					wrapperClass="mt-4"
				/>
			{/if}

			{#if (activity.included && activity.included.length > 0) || (activity.excluded && activity.excluded.length > 0)}
				<Spacer />
				<!-- pdp-included-excluded -->
				<h2 class="h2 mt-4 mb-4 lg:mt-6">Qué incluye esta excursión</h2>
				<ul class="pdp-list pdp-included-excluded space-y-1">
					{#each activity.included ?? [] as item, i (i)}
						<li class="flex items-start gap-2">
							<CustomMiniTick class="mt-0.5 size-5 shrink-0 text-green-600" />
							<span>{msgs[`enum_activityIncluded_${item}`]?.() ?? item}</span>
						</li>
					{/each}
					{#each activity.excluded ?? [] as item, i (i)}
						<li class="flex items-start gap-2">
							<CustomMiniCancel class="mt-0.5 size-5 shrink-0 text-red-500" />
							<span>{msgs[`enum_activityExcluded_${item}`]?.() ?? item}</span>
						</li>
					{/each}
				</ul>
			{/if}

			{#if activity.notSuitableFor && activity.notSuitableFor.length > 0}
				<Spacer />
				<!-- Not Suitable For -->
				<p class="h2 mt-4 mb-2 lg:mt-6">No apto para</p>
				<ul class="pdp-willdoing list-inside list-disc space-y-0.5 pl-2">
					{#each activity.notSuitableFor as item, i (i)}
						<li>{msgs[`enum_activityNotSuitableFor_${item}`]?.() ?? item}</li>
					{/each}
				</ul>
			{/if}

			{#if activity.restrictions && activity.restrictions.length > 0}
				<Spacer />
				<p class="h2 mt-4 mb-2 lg:mt-6">Elementos no permitidos en esta actividad</p>
				<ul class="pdp-willdoing list-inside list-disc space-y-0.5 pl-2">
					{#each activity.restrictions as item, i (i)}
						<li>{msgs[`enum_activityRestriction_${item}`]?.() ?? item}</li>
					{/each}
				</ul>
			{/if}

			{#if activity.petsAllowed}
				<Spacer />
				<!-- Pets Allowed -->
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

			{#if activity.supplierTip}
				<Spacer />

				<!-- pdp-single-conditions -->
				<PdpSingleConditions
					data={{
						icon: 'HandHeart',
						title: 'Consejo by buendía',
						description: activity.supplierTip
					}}
					wrapperClass="mt-4 mb-4 lg:mt-8 lg:mb-8"
				/>
			{/if}

			<Spacer />

			{#if reviewItems?.length > 0}
				<div class="pdp-review-gallery mb-8">
					<h2 class="h2">Opiniones de {activity.title}</h2>

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
				</div>
			{/if}

			{#if data.reviewsStats}
				<p class="h4 mb-4">Valoración</p>
				<PdpReviewsAverage
					stats={data.reviewsStats}
					activityTitle={activity.title}
					onStarsChange={async (stars) => {
						activeStars = stars;
						await loadActivityReviews({
							...SORT_PARAMS[sortValue],
							skip: 0,
							limit: data.reviewsLimit,
							averageRatings: stars
						});
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
				<Checkout
					activityOptions={data.activityOptions}
					minPrice={data.activity.minPrice}
					{isOwned}
				/>

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
