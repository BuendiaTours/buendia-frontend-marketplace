<script lang="ts">
	import type { PageData } from './$types';
	import { resolveRoute } from '$app/paths';

	// Lib
	import { format } from 'date-fns';

	// Components
	import ActivityCard from '$lib/components/marketplace/ActivityCard.svelte';
	import Breadcrumb from '$lib/components/marketplace/Breadcrumbs.svelte';
	import GallerySquareThumbs from '$lib/components/marketplace/GallerySquareThumbs.svelte';
	import ReviewCard from '$lib/components/marketplace/ReviewCard.svelte';
	import Faqs from '$lib/components/marketplace/Faqs.svelte';

	let { data }: { data: PageData } = $props();
</script>

<div class="wrapper">
	<div class="my-6">
		<Breadcrumb items={data.breadcrumbs} />
	</div>

	<!-- Destination Info -->
	<div class="e-card mb-8">
		<h1 class="mb-4 font-bold text-gray-900">{data.destination.name}</h1>
		{#if data.destination.descriptionShort}
			<p class="text-gray-600">{data.destination.descriptionShort}</p>
		{/if}
		{#if data.destination.image?.originalUrl}
			<div class="mt-4">
				<img
					src={data.destination.image.originalUrl}
					alt={data.destination.name}
					class="h-64 w-full rounded-lg object-cover"
				/>
			</div>
		{/if}
	</div>

	<!-- Categories List -->
	<div class="e-card mb-8">
		<h2 class="mb-4 font-semibold text-gray-800">Categorías</h2>

		{#if data.categories && data.categories.length > 0}
			<ul class="space-y-3">
				{#each data.categories as category (category.slug)}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- /categoria/[slug] route not yet created -->
					<li class="border-b border-gray-100 pb-3 last:border-b-0">
						<a
							href={`/categoria/${category.slug}`}
							class="block hover:text-blue-600 hover:underline"
						>
							{category.name}
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-gray-500">No hay categorías disponibles en este destino.</p>
		{/if}
	</div>

	<!-- Activities List -->
	<div class="e-card mb-8">
		<h2 class="mb-4 font-semibold text-gray-800">
			Actividades en {data.destination.name}
		</h2>

		{#if data.activities && data.activities.length > 0}
			<ul class="space-y-3">
				{#each data.activities as activity (activity.id)}
					<li class="border-b border-gray-100 pb-3 last:border-b-0">
						<a
							href={resolveRoute('/(marketplace)/actividad/[slug]', { slug: activity.slug })}
							class="block hover:text-blue-600 hover:underline"
						>
							<h3 class="font-medium text-gray-800">{activity.title}</h3>
							{#if activity.descriptionShort}
								<p class="mt-1 text-gray-600">{activity.descriptionShort}</p>
							{/if}
						</a>
					</li>
				{/each}
			</ul>

			<!-- Pagination info -->
			{#if data.pagination && data.pagination.total > data.pagination.pageSize}
				<div class="mt-4 text-center text-gray-600">
					Página {data.pagination.page} de {Math.ceil(
						data.pagination.total / data.pagination.pageSize
					)}
				</div>
			{/if}
		{:else}
			<p class="text-gray-500">No hay actividades disponibles en este destino.</p>
		{/if}
	</div>

	<!-- Reviews List -->
	{#if data.reviews && data.reviews.length > 0}
		<div id="plp-reviews" class="plp-reviews grid grid-cols-3 gap-4">
			{#each data.reviews as review (review.id)}
				<div
					class="flex flex-col justify-between rounded-xl border border-[var(--color-border-default)] p-6 pb-6"
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
						<a href="#" class="p-base underline underline-offset-8">Cena en el Trastévere</a>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Back to home link -->

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each data.destination.activities as activity (activity.id)}
			<ActivityCard
				item={activity}
				wrapperClass="border-b border-solid border-neutral-200 pb-4 sm:p-3 sm:border sm:rounded-xl"
			/>
		{/each}
	</div>

	<!-- faqs -->
	<Faqs
		title={data.destination.faqsTitle}
		faqs={data.destination.faqs}
		wrapperClass="mt-12 lg:my-23"
		fullOpened
	/>
</div>
