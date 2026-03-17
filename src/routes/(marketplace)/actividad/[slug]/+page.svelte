<script lang="ts">
	import type { PageData } from './$types';

	// Components
	import type { BndLightboxItem } from '$lib/types';
	import { ReviewsLayout } from '$lib/components/marketplace/BndLightbox';

	import { reviewsEndpoints } from '$lib/api/marketplace/endpoints/reviews';
	import type { ActivityReviewParams } from '$lib/types';

	import Badge from '$lib/components/marketplace/Badge.svelte';
	import Conditions from '$lib/components/marketplace/Conditions.svelte';
	import Faqs from '$lib/components/marketplace/Faqs.svelte';
	import GallerySquareThumbs from '$lib/components/marketplace/GallerySquareThumbs.svelte';
	import PdpBrandBanner from '$lib/components/marketplace/pdp/PdpBrandBanner.svelte';
	import PdpHeader from '$lib/components/marketplace/pdp/PdpHeader.svelte';
	import PdpHighlights from '$lib/components/marketplace/pdp/PdpHighlights.svelte';
	import PdpHeadGallery from '$lib/components/marketplace/pdp/PdpHeadGallery.svelte';
	import PdpSingleConditions from '$lib/components/marketplace/pdp/PdpSingleConditions.svelte';
	import PdpByBuendiaBanner from '$lib/components/marketplace/pdp/PdpByBuendiaBanner.svelte';
	import ReviewCard from '$lib/components/marketplace/ReviewCard.svelte';
	import ReviewComment from '$lib/components/marketplace/ReviewComment.svelte';
	import Spacer from '$lib/components/marketplace/Spacer.svelte';

	// Icons
	import { VerifiedCheck } from '$lib/icons/Linear';

	let { data }: { data: PageData } = $props();
	const activity = $derived(data.activity);

	// Estado cliente para reviews (sort + show more)
	let reviews = $state(data.reviews);
	let reviewsTotal = $state(data.reviewsTotal);
	let sortValue = $state<'recommended' | 'best' | 'worst'>('recommended');
	let currentPage = $state(1);
	let totalPages = $state(data.reviewsTotalPages);
	let isLoadingReviews = $state(false);

	const hasMoreReviews = $derived(currentPage < totalPages);
	const activityId = $derived(data.activity.id);

	const SORT_PARAMS: Record<string, ActivityReviewParams> = {
		recommended: {},
		best: { sort: 'averageRating', order: 'DESC' },
		worst: { sort: 'averageRating', order: 'ASC' }
	};

	async function loadActivityReviews(params: ActivityReviewParams, append = false) {
		isLoadingReviews = true;
		try {
			const result = await reviewsEndpoints.getByActivityId(fetch, activityId, params);
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
		await loadActivityReviews(SORT_PARAMS[value] ?? {});
	}

	async function handleShowMore() {
		await loadActivityReviews({ ...SORT_PARAMS[sortValue], page: currentPage + 1 }, true);
	}

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

<div class="my-6 min-h-45 bg-white p-6">Caja que ocupa TODO el ancho</div>

<div class="wrapper">
	<!-- pdp-head-gallery -->
	<PdpHeadGallery items={activity.multimedias} />

	<!-- pdp-header -->
	<PdpHeader dataBreadcrumbs={data.breadcrumbs} title={activity.title} />

	<!-- highlights -->
	<PdpHighlights
		items={activity.pdpHighlights}
		wrapperClass="py-4 mt-2 mb-2 lg:py-8 lg:mt-0 lg:mb-0"
	/>

	<Spacer margin="my-0" />

	<!-- faqs -->
	<Faqs title={activity.faqsTitle} faqs={activity.faqs} />

	<!-- conditions -->
	<p class="h2 pt-4 pb-4 lg:pt-8">{activity.conditionsTitle}</p>
	{#each activity.conditions as condition (condition.id)}
		<Conditions style={condition.style} items={condition.items} />
	{/each}

	<Spacer />

	<!-- pdp-by-buendia-banner -->
	{#if activity.byBuendiaBanner}
		<PdpByBuendiaBanner
			title={activity.byBuendiaBanner.title}
			description={activity.byBuendiaBanner.description}
			items={activity.byBuendiaBanner.items}
			link={activity.byBuendiaBanner.link}
		/>
	{/if}
	<Spacer />

	<!-- pdp-brand-banner -->
	<PdpBrandBanner
		title="¿Sabías qué?"
		description="Brujas y Gante fueron dos de las ciudades más ricas de Europa durante la Edad Media gracias al comercio textil. Sus centros históricos han conservado casi intacto el trazado urbano medieval, lo que les ha valido el reconocimiento como Patrimonio de la Humanidad por la UNESCO."
		image="https://dummyimage.com/666x666/ffffff/000000.jpg"
		imageAlt="Imagén de prueba"
		wrapperClass="my-12"
	/>

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

	<!-- Activity Header -->
	<div class="e-card mb-8">
		<h1 class="mb-4 font-bold text-gray-900">{activity.title}</h1>
		<div class="mb-2 flex gap-2">
			<Badge data={{ icon: 'FireFlame', title: activity.kind, class: 'bg-red-500' }} />
			<Badge data={{ title: activity.status, class: 'bg-green-500' }} />
		</div>
		{#if activity.descriptionShort}
			<p class="text-gray-600">{activity.descriptionShort}</p>
		{/if}
	</div>

	<!-- Basic Info -->
	<div class="e-card mb-8">
		<h2 class="mb-4 font-semibold text-gray-800">Información básica</h2>
		<dl class="space-y-2">
			<div>
				<dt class="font-medium text-gray-700">ID:</dt>
				<dd class="text-gray-600">{activity.id}</dd>
			</div>
			<div>
				<dt class="font-medium text-gray-700">Código de referencia:</dt>
				<dd class="text-gray-600">{activity.codeRef}</dd>
			</div>
			<div>
				<dt class="font-medium text-gray-700">Slug:</dt>
				<dd class="text-gray-600">{activity.slug}</dd>
			</div>
			<div>
				<dt class="font-medium text-gray-700">Tipo de guía:</dt>
				<dd class="text-gray-600">{activity.guideKind}</dd>
			</div>
			<div>
				<dt class="font-medium text-gray-700">Tipo de transporte:</dt>
				<dd class="text-gray-600">{activity.transportKind}</dd>
			</div>
			{#if activity.transportLocation}
				<div>
					<dt class="font-medium text-gray-700">Ubicación del transporte:</dt>
					<dd class="text-gray-600">{activity.transportLocation}</dd>
				</div>
			{/if}
		</dl>
	</div>

	<!-- Description -->
	{#if activity.descriptionFull}
		<div class="e-card mb-8">
			<h2 class="mb-4 font-semibold text-gray-800">Descripción completa</h2>
			<div class="prose max-w-none text-gray-600">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- API content, sanitized server-side -->
				{@html activity.descriptionFull}
			</div>
		</div>
	{/if}

	<Spacer />

	<!-- pdp-reviews-featured -->
	{#if data.reviews && data.reviews.length > 1}
		<div class="pdp-reviews-featured">
			<p class="pdp-reviews-featured__title h2 mb-4">Opiniones destacadas</p>
			<div
				class="pdp-reviews-featured__reviews flex snap-x snap-mandatory gap-4 overflow-x-auto sm:overflow-visible"
			>
				{#each data.reviews.slice(0, 2) as review (review.id)}
					<div class="w-5/6 flex-none snap-start snap-always sm:w-auto sm:flex-1">
						<ReviewCard
							name={review.user || 'Anónimo'}
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
				class="p-base mt-4 block font-bold text-neutral-800 underline underline-offset-8"
				>Ver todas las opiniones</a
			>
		</div>
	{/if}

	<Spacer />

	<!-- Important Info -->
	{#if activity.infoImportant}
		<div class="e-card mb-8">
			<h2 class="mb-4 font-semibold text-yellow-900">⚠️ Información importante</h2>
			<p class="text-yellow-800">{activity.infoImportant}</p>
		</div>
	{/if}

	<!-- Destinations -->
	{#if activity.destinations && activity.destinations.length > 0}
		<div class="e-card mb-8">
			<h2 class="mb-4 font-semibold text-gray-800">Destinos</h2>
			<ul class="list-inside list-disc space-y-1 text-gray-600">
				{#each activity.destinations as destination (destination.name)}
					<li>{destination.name}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Categories -->
	{#if activity.categories && activity.categories.length > 0}
		<div class="e-card mb-8">
			<h2 class="mb-4 font-semibold text-gray-800">Categorías</h2>
			<ul class="list-inside list-disc space-y-1 text-gray-600">
				{#each activity.categories as category (category.name)}
					<li>{category.name}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Attractions -->
	{#if activity.attractions && activity.attractions.length > 0}
		<div class="e-card mb-8">
			<h2 class="mb-4 font-semibold text-gray-800">Atracciones</h2>
			<ul class="list-inside list-disc space-y-1 text-gray-600">
				{#each activity.attractions as attraction (attraction.name)}
					<li>{attraction.name}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Included -->
	{#if activity.included && activity.included.length > 0}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 font-semibold text-gray-800">✅ Incluido</h2>
			<ul class="list-inside list-disc space-y-1 text-gray-600">
				{#each activity.included as item, i (i)}
					<li>{item}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Excluded -->
	{#if activity.excluded && activity.excluded.length > 0}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 font-semibold text-gray-800">❌ No incluido</h2>
			<ul class="list-inside list-disc space-y-1 text-gray-600">
				{#each activity.excluded as item, i (i)}
					<li>{item}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Items to Bring -->
	{#if activity.itemsToBring && activity.itemsToBring.length > 0}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 font-semibold text-gray-800">🎒 Qué llevar</h2>
			<ul class="list-inside list-disc space-y-1 text-gray-600">
				{#each activity.itemsToBring as item, i (i)}
					<li>{item}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Will Doing -->
	{#if activity.willDoing && activity.willDoing.length > 0}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 font-semibold text-gray-800">🎯 Qué harás</h2>
			<ul class="list-inside list-disc space-y-1 text-gray-600">
				{#each activity.willDoing as item, i (i)}
					<li>{item}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Meals -->
	{#if activity.meals && activity.meals.length > 0}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 font-semibold text-gray-800">🍽️ Comidas</h2>
			<ul class="list-inside list-disc space-y-1 text-gray-600">
				{#each activity.meals as meal, i (i)}
					<li>{meal}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Stages -->
	{#if activity.stages && activity.stages.length > 0}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 font-semibold text-gray-800">📍 Etapas</h2>
			<ul class="list-inside list-disc space-y-1 text-gray-600">
				{#each activity.stages as stage, i (i)}
					<li>{stage}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Restrictions -->
	{#if activity.restrictions && activity.restrictions.length > 0}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 font-semibold text-gray-800">🚫 Restricciones</h2>
			<ul class="list-inside list-disc space-y-1 text-gray-600">
				{#each activity.restrictions as restriction, i (i)}
					<li>{restriction}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Not Suitable For -->
	{#if activity.notSuitableFor && activity.notSuitableFor.length > 0}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 font-semibold text-gray-800">⚠️ No recomendado para</h2>
			<ul class="list-inside list-disc space-y-1 text-gray-600">
				{#each activity.notSuitableFor as item, i (i)}
					<li>{item}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Pets Allowed -->
	{#if activity.petsAllowed}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 font-semibold text-gray-800">🐕 Mascotas</h2>
			<p class="mb-2 font-medium text-gray-700">
				{activity.petsAllowed.allowed === 'YES' ? '✅ Permitidas' : '❌ No permitidas'}
			</p>
			{#if activity.petsAllowed.description}
				<p class="text-gray-600">{activity.petsAllowed.description}</p>
			{/if}
		</div>
	{/if}

	<!-- Tags -->
	{#if activity.tags && activity.tags.length > 0}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 font-semibold text-gray-800">🏷️ Etiquetas</h2>
			<div class="flex flex-wrap gap-2">
				{#each activity.tags as tag (tag.name)}
					<span class="rounded-full bg-gray-200 px-3 py-1 text-gray-700">{tag.name}</span>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Distributives -->
	{#if activity.distributives && activity.distributives.length > 0}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 font-semibold text-gray-800">📄 Páginas distributivas</h2>
			<ul class="list-inside list-disc space-y-1 text-gray-600">
				{#each activity.distributives as distributive (distributive.name)}
					<li>{distributive.name}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Contact Info -->
	{#if activity.phoneContact}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 font-semibold text-gray-800">📞 Contacto</h2>
			<p class="text-gray-600">{activity.phoneContact}</p>
		</div>
	{/if}

	<!-- Voucher Info -->
	{#if activity.voucherInfo}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 font-semibold text-gray-800">🎫 Información del voucher</h2>
			<p class="text-gray-600">{activity.voucherInfo}</p>
		</div>
	{/if}

	<!-- Multimedias -->
	<!-- {#if activity.multimedias && activity.multimedias.length > 0}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 font-semibold text-gray-800">📸 Multimedia</h2>
			<ul class="list-inside list-disc space-y-1 text-gray-600">
				{#each activity.multimedias as media, i (i)}
					<li>{media}</li>
				{/each}
			</ul>
		</div>
	{/if} -->

	<div class="pdp-review-gallery">
		<p class="h2">Opiniones de Excursiones a Brujas y Gante desde Bruselas</p>

		<p class="p-base text-bold mt-4">Fotos de nuestros viajeros</p>

		<GallerySquareThumbs
			items={reviewItems}
			visibleCount={3}
			thumbClass="w-[245px]"
			wrapperClass="mt-4 gap-4 @max-[400px]:flex-wrap @max-[400px]:justify-center"
			showCount={true}
			categoryId="reviews"
			categoryLabel="Fotos de viajeros"
			layoutComponent={ReviewsLayout}
		/>
	</div>

	<Spacer />

	<!-- Reviews -->
	<div class="pdp-review-list" id="reviews">
		<div class="pdp-review-list__header mb-4 flex flex-row items-center justify-between gap-2">
			<div class="flex items-center gap-1">
				<VerifiedCheck class="size-5" />
				<p class="p-base whitespace-nowrap">Opiniones verificadas ({reviewsTotal})</p>
			</div>
			<div class="flex items-center gap-3">
				<p class="p-base whitespace-nowrap">Ordenar por</p>
				<select
					class="select"
					aria-label="Seleccionar orden"
					value={sortValue}
					onchange={(e) => handleReviewSortChange(e.currentTarget.value)}
				>
					<option value="recommended">Recomendado</option>
					<option value="best">Mejor valoración</option>
					<option value="worst">Peor valoración</option>
				</select>
			</div>
		</div>
		<ul id="pdp-review-list__reviews" class="pdp-review-list__reviews space-y-6">
			{#if reviews.length > 0}
				{#each reviews as review (review.id)}
					<li class="border-b border-[var(--color-border-default)] pb-6">
						<ReviewCard
							name={review.user || 'Anónimo'}
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
								wrapperClass="mt-4 gap-2"
								thumbClass="w-34"
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
			<div class="pdp-review-list__footer-actions mt-6 flex">
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
