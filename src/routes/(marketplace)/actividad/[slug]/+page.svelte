<script lang="ts">
	import type { PageData } from './$types';

	// Components
	import Badge from '$lib/components/marketplace/Badge.svelte';
	import PdpHeadGallery from '$lib/components/marketplace/pdp/PdpHeadGallery.svelte';
	import PdpHeader from '$lib/components/marketplace/PdpHeader.svelte';
	import PdpBrandBanner from '$lib/components/marketplace/PdpBrandBanner.svelte';
	import ReviewCard from '$lib/components/marketplace/ReviewCard.svelte';
	import GallerySquareThumbs from '$lib/components/marketplace/GallerySquareThumbs.svelte';
	import { ReviewsLayout } from '$lib/components/marketplace/BndLightbox';
	import type { BndLightboxItem } from '$lib/types';
	import ReviewComment from '$lib/components/marketplace/ReviewComment.svelte';
	import Spacer from '$lib/components/marketplace/Spacer.svelte';

	let { data }: { data: PageData } = $props();
	const activity = $derived(data.activity);

	const reviewItems = $derived<BndLightboxItem[]>(
		data.reviews.flatMap((review, reviewIdx) =>
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

	<!-- pdp-brand-banner -->
	<PdpBrandBanner
		title="¿Sabías qué?"
		description="Brujas y Gante fueron dos de las ciudades más ricas de Europa durante la Edad Media gracias al comercio textil. Sus centros históricos han conservado casi intacto el trazado urbano medieval, lo que les ha valido el reconocimiento como Patrimonio de la Humanidad por la UNESCO."
		image="https://dummyimage.com/666x666/ffffff/000000.jpg"
		imageAlt="Imagén de prueba"
		wrapperClass="my-12"
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
		<div class="pdp-reviews-featured bg-white">
			<p class="pdp-reviews-featured__title h2 mb-4">Opiniones destacadas</p>
			<div class="pdp-reviews-featured__reviews flex flex-col gap-4 sm:flex-row">
				{#each data.reviews.slice(0, 2) as review (review.id)}
					<ReviewCard
						name={review.user || 'Anónimo'}
						text={review.content}
						rating={review.averageRating}
						lines={3}
						wrapperClass="p-6 border border-[var(--color-border-default)] rounded-lg"
						{...review}
					/>
				{/each}
			</div>
			<a href="#reviews" class="p-base ml-1 font-bold text-neutral-800 underline underline-offset-8"
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
	{#if activity.multimedias && activity.multimedias.length > 0}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 font-semibold text-gray-800">📸 Multimedia</h2>
			<ul class="list-inside list-disc space-y-1 text-gray-600">
				{#each activity.multimedias as media, i (i)}
					<li>{media}</li>
				{/each}
			</ul>
		</div>
	{/if}

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
	<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<h2 class="mb-4 font-semibold text-gray-800">Reviews ({data.reviews.length})</h2>
		<ul class="space-y-6">
			{#if data.reviews && data.reviews.length > 0}
				{#each data.reviews as review (review.id)}
					<li class="border-b border-[var(--color-border-default)] pb-6 last:border-0 last:pb-0">
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
	</div>
</div>
