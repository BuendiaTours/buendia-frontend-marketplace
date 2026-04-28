<script lang="ts">
	import { format } from 'date-fns';

	// Components
	import AccordionOnMobile from '$lib/components/marketplace/AccordionOnMobile.svelte';
	import StarRating from '$lib/components/marketplace/StarRating.svelte';
	import PlpSwiper from '$lib/components/marketplace/plp/PlpSwiper.svelte';
	import WhyUsGrid from '$lib/components/marketplace/WhyUsGrid.svelte';
	import ReviewCard from '$lib/components/marketplace/ReviewCard.svelte';
	import GallerySquareThumbs from '$lib/components/marketplace/GallerySquareThumbs.svelte';
	import ActivityCard from '$lib/components/marketplace/ActivityCard.svelte';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Destination = { title: string; slug: string; image: string; rating?: number };

	const destinations: Destination[] = [
		{ title: 'Bruselas', slug: 'bruselas', image: 'marketplace/destinations/brucelas.png' },
		{ title: 'Nueva York', slug: 'nueva-york', image: 'marketplace/destinations/nuevayork.png' },
		{ title: 'Lisboa', slug: 'lisboa', image: 'marketplace/destinations/lisboa.png' },
		{ title: 'París', slug: 'paris', image: 'marketplace/destinations/paris.png' },
		{ title: 'Roma', slug: 'roma', image: 'marketplace/destinations/roma.png' },
		{ title: 'Praga', slug: 'praga', image: 'https://dummyimage.com/228.8x306/000/fff.png' },
		{ title: 'Budapest', slug: 'budapest', image: 'https://dummyimage.com/228.8x306/000/fff.png' },
		{ title: 'Berlín', slug: 'berlin', image: 'https://dummyimage.com/228.8x306/000/fff.png' }
	];

	const atractions: Destination[] = [
		{
			title: 'Vaticano',
			slug: 'roma/vaticano',
			image: 'marketplace/destinations/vaticano.png',
			rating: 4.6
		},
		{
			title: 'Torre Eiffel',
			slug: 'paris/torre-eiffel',
			image: 'marketplace/destinations/torreeiffel.png',
			rating: 4.7
		},
		{
			title: 'Coliseo Romano',
			slug: 'roma/coliseo-romano',
			image: 'marketplace/destinations/coliseoromano.png',
			rating: 4.8
		},
		{
			title: 'Atomium',
			slug: 'bruselas/atomium',
			image: 'marketplace/destinations/atomium.png',
			rating: 4.9
		},
		{
			title: 'La Giralda',
			slug: 'sevilla/la-giralda',
			image: 'marketplace/destinations/lagiralda.png',
			rating: 4.5
		},
		{
			title: 'Atraction',
			slug: '',
			image: 'https://dummyimage.com/228.8x306/000/fff.png',
			rating: 4.6
		},
		{
			title: 'Atraction 2',
			slug: '',
			image: 'https://dummyimage.com/228.8x306/000/fff.png',
			rating: 4.6
		},
		{
			title: 'Atraction 3',
			slug: '',
			image: 'https://dummyimage.com/228.8x306/000/fff.png',
			rating: 4.6
		}
	];
</script>

<div class="wrapper mt-6">
	<WhyUsGrid
		data={[
			{
				title: '​Empresa mejor valorada del sector en Trustpilot',
				description: 'Nuestra media de satisfacción es de 4,7 sobre 5, con más 47,000 opiniones.'
			},
			{
				icon: 'Heart',
				title: '​Empresa mejor valorada del sector en Trustpilot',
				description: 'Nuestra media de satisfacción es de 4,7 sobre 5, con más 47,000 opiniones.'
			},
			{
				icon: 'BuendiaCommentHollow',
				title: '​Empresa mejor valorada del sector en Trustpilot',
				description: 'Nuestra media de satisfacción es de 4,7 sobre 5, con más 47,000 opiniones.'
			},
			{
				icon: 'SmileCircle',
				title: '​Empresa mejor valorada del sector en Trustpilot',
				description: 'Nuestra media de satisfacción es de 4,7 sobre 5, con más 47,000 opiniones.'
			}
		]}
		wrapperClass="mt-12 mb-12 sm:mt-16 sm:mb-16 lg:mt-24 lg:mb-24"
	/>
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
				<h2 class="h2-editorial text-neutral-800">Planes by buendía</h2>
				<a href="/planes-by-buendia" class="p-base cursor-pointer underline underline-offset-8">
					Ver todos los planes by buendía
				</a>
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

<div class="wrapper mt-6">
	<PlpSwiper
		swiperOptions={{
			slidesPerView: 'auto',
			spaceBetween: 16,
			navigation: true,
			loop: false
		}}
		wrapperClass="mt-12 mb-12 sm:mt-16 sm:mb-16 lg:mt-24 lg:mb-24"
	>
		{#snippet header()}
			<h2 class="h2-editorial text-neutral-800">Destinos favoritos</h2>
		{/snippet}
		{#each destinations as destination (destination.title)}
			<swiper-slide class="flex aspect-3/4 w-[228.8px]">
				<a
					href="/{destination.slug}"
					class="c-detination-card relative flex w-full items-end justify-start rounded-lg bg-cover bg-center p-6"
					style="background-image: url({destination.image})"
				>
					<p class="h3-editorial relative z-10 text-white">
						{destination.title}
					</p>
				</a>
			</swiper-slide>
		{/each}
	</PlpSwiper>
</div>

<div class="wrapper mt-6">
	<PlpSwiper
		swiperOptions={{
			slidesPerView: 'auto',
			spaceBetween: 16,
			navigation: true,
			loop: false
		}}
		wrapperClass="mt-12 mb-12 sm:mt-16 sm:mb-16 lg:mt-24 lg:mb-24"
	>
		{#snippet header()}
			<h2 class="h2-editorial text-neutral-800">Atracciones más visitadas</h2>
		{/snippet}
		{#each atractions as atraction (atraction.title)}
			<swiper-slide class="flex aspect-3/4 w-[228.8px]">
				<a
					href="/{atraction.slug}"
					class="c-detination-card relative flex w-full flex-col items-start justify-between rounded-lg bg-cover bg-center p-6"
					style="background-image: url({atraction.image})"
				>
					<span
						class="p-lg relative z-10 flex items-center gap-1 rounded-lg border border-solid border-neutral-400 bg-white px-3 py-2 font-bold"
					>
						<StarRating single size="sm" />
						{atraction.rating}
					</span>
					<p class="h3-editorial relative z-10 text-white">
						{atraction.title}
					</p>
				</a>
			</swiper-slide>
		{/each}
	</PlpSwiper>
</div>

<div class="wrapper mt-6">
	{#if data.reviews && data.reviews.length > 0}
		<PlpSwiper
			id="plp-reviews"
			swiperOptions={{
				slidesPerView: 1.15,
				spaceBetween: 16,
				navigation: true,
				loop: false,
				breakpoints: {
					640: { slidesPerView: 2.1 },
					1024: { slidesPerView: 3 }
				}
			}}
			wrapperClass="mt-12 mb-12 sm:mt-16 sm:mb-16 lg:mt-24 lg:mb-24"
		>
			{#snippet header()}
				<div class="flex flex-col">
					<h2 class="h2-editorial text-neutral-800">Miles de viajeros confían en buendía</h2>
					<div class="mt-1 flex items-center">
						<StarRating single size="md" />
						<span class="p-lg font-bold">4.5</span>
						<span class="p-sm ml-2 text-neutral-600">Valoración media según XXX opiniones</span>
					</div>
				</div>
			{/snippet}
			{#each data.reviews as review (review.id)}
				<swiper-slide>
					<div
						class="flex h-full flex-col justify-between rounded-xl border border-[var(--color-border-default)] p-6 pb-6"
					>
						<ReviewCard
							name={review.user || 'Anónimo'}
							desc={review.createdAt ? format(new Date(review.createdAt), 'dd/MM/yyyy') : undefined}
							text={review.content}
							rating={review.averageRating}
							lines={3}
							{...review}
						/>

						{#if review.attachments && review.attachments.length > 0}
							<GallerySquareThumbs
								items={review.attachments.map((att) => ({ src: att.url.value }))}
								visibleCount={3}
								categoryId="review-{review.id}"
								containerClass="mt-auto pt-4"
								wrapperClass="plp-reviews__gallery gap-2"
								thumbClass="w-1/3"
							/>
						{/if}

						<div class="plp-reviews__about mt-4">
							<p class="p-base text-neutral-600">Opinión sobre</p>
							<a href="#" class="p-base cursor-pointer underline underline-offset-8"
								>Cena en el Trastévere</a
							>
						</div>
					</div>
				</swiper-slide>
			{/each}
		</PlpSwiper>
	{/if}
</div>

<div class="wrapper mt-6">
	<div class="e-card mb-2 p-2 text-center">
		<h1 class="bg-success-500 mb-4 font-serif font-semibold text-gray-900">Home del Marketplace</h1>
		<p class="text-neutral-700">Página pública - Solo Tailwind CSS (sin DaisyUI)</p>

		<StarRating value={3.5} size="md" filledClass="text-blue-500" emptyClass="text-blue-100" />

		<AccordionOnMobile open={true}>
			{#snippet summary()}
				<p class="h1">Información del producto</p>
			{/snippet}
			<p>Contenido visible siempre en desktop, colapsable en mobile.</p>
		</AccordionOnMobile>

		<div>
			<div class="e-button">Button</div>
			<div class="e-button e-button-sm e-button-primary">Button</div>
			<div class="e-button e-button-lg">Button</div>
		</div>
		<div>
			<div class="e-button" disabled>Button</div>
			<div class="e-button e-button-sm e-button-primary" disabled>Button</div>
			<div class="e-button e-button-lg" disabled>Button</div>
		</div>
		<div>
			<div class="e-button e-button-secondary">Button</div>
			<div class="e-button e-button-secondary e-button-sm e-button-primary">Button</div>
			<div class="e-button e-button-secondary e-button-lg">Button</div>
		</div>
		<div>
			<div class="e-button e-button-secondary" disabled>Button</div>
			<div class="e-button e-button-secondary e-button-sm e-button-primary" disabled>Button</div>
			<div class="e-button e-button-secondary e-button-lg" disabled>Button</div>
		</div>
		<div>
			<div class="e-button e-button-tertiary">Button</div>
			<div class="e-button e-button-tertiary e-button-sm e-button-primary">Button</div>
			<div class="e-button e-button-tertiary e-button-lg">Button</div>
		</div>
		<div>
			<div class="e-button e-button-tertiary" disabled>Button</div>
			<div class="e-button e-button-tertiary e-button-sm e-button-primary" disabled>Button</div>
			<div class="e-button e-button-tertiary e-button-lg" disabled>Button</div>
		</div>
	</div>

	<div class="e-card mb-8">
		<h2 class="mb-3 font-semibold text-gray-800">Destinos</h2>

		{#if data.destinations && data.destinations.length > 0}
			<ul class="mt-4 space-y-2">
				{#each data.destinations as destination (destination.slug)}
					<li class="text-gray-700">
						<a href="/{destination.slug}" class="hover:text-blue-600 hover:underline">
							{destination.name}
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="mt-4 text-gray-500">No hay destinos disponibles en este momento.</p>
		{/if}
	</div>

	<div class="e-card mb-8">
		<h2 class="mb-3 font-semibold text-gray-800">Free tours</h2>

		{#if data.freeTours && data.freeTours.length > 0}
			<ul class="mt-4 space-y-2">
				{#each data.freeTours as activity (activity.slug)}
					<li class="text-gray-700">
						<a href="/actividad/{activity.slug}" class="hover:text-blue-600 hover:underline">
							{activity.title}
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="mt-4 text-gray-500">No hay free tours disponibles en este momento.</p>
		{/if}
	</div>

	<div class="e-card mb-4">
		<h2 class="mb-3 font-semibold text-gray-800">Paid tours</h2>

		{#if data.paidTours && data.paidTours.length > 0}
			<ul class="mt-4 space-y-2">
				{#each data.paidTours as activity (activity.slug)}
					<li class="text-gray-700">
						<a href="/actividad/{activity.slug}" class="hover:text-blue-600 hover:underline">
							{activity.title}
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="mt-4 text-gray-500">No hay paid tours disponibles en este momento.</p>
		{/if}
	</div>

	<div class="e-card mb-6">
		<h2 class="mb-3 font-semibold text-gray-800">Other tours</h2>

		{#if data.otherTours && data.otherTours.length > 0}
			<ul class="mt-4 space-y-2">
				{#each data.otherTours as activity (activity.slug)}
					<li class="text-gray-700">
						<a href="/actividad/{activity.slug}" class="hover:text-blue-600 hover:underline">
							{activity.title}
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="mt-4 text-gray-500">No hay other tours disponibles en este momento.</p>
		{/if}
	</div>
</div>
