<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { patchFilters } from '$lib/utils/filters';
	import { destinationActivitiesFiltersSchema } from './schemas/filters.schema';
	// Lib
	import { format } from 'date-fns';

	// Components
	import ActivityCard from '$lib/components/marketplace/ActivityCard.svelte';
	import Breadcrumb from '$lib/components/marketplace/Breadcrumbs.svelte';
	import ContentBlockStack from '$lib/components/marketplace/ContentBlockStack.svelte';
	import GallerySquareThumbs from '$lib/components/marketplace/GallerySquareThumbs.svelte';
	import HeroImg from '$lib/components/marketplace/HeroImg.svelte';
	import NewsletterRegistration from '$lib/components/marketplace/NewsletterRegistration.svelte';
	import ReviewCard from '$lib/components/marketplace/ReviewCard.svelte';
	import FaqsInline from '$lib/components/marketplace/FaqsInline.svelte';
	import ScrollableTabBar from '$lib/components/marketplace/ScrollableTabBar.svelte';

	let { data }: { data: PageData } = $props();

	const activeKind = $derived($page.url.searchParams.get('kind'));

	function buildUrl(kind: string | null) {
		const newParams = patchFilters(destinationActivitiesFiltersSchema, $page.url.searchParams, {
			kind: kind ?? null
		});
		const qs = newParams.toString();
		return qs ? `${$page.url.pathname}?${qs}` : $page.url.pathname;
	}

	const tabs = $derived([
		{ id: 'all', name: 'Todo', href: buildUrl(null) },
		...data.activityKinds.map((k) => ({ id: k.id, name: k.name, href: buildUrl(k.id) }))
	]);
</script>

<div class="wrapper">
	<div class="my-6">
		<Breadcrumb items={data.breadcrumbs} />
	</div>

	<HeroImg imgObj={data.destination.image} title={`Qué hacer en ${data.destination.name}`} />

	<!-- <textarea class="w-full font-mono">{JSON.stringify(data.destination)}</textarea> -->

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

	<ScrollableTabBar {tabs} activeId={activeKind ?? 'all'} wrapperClass="my-6" />

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
						<a href="#" class="p-base cursor-pointer underline underline-offset-8"
							>Cena en el Trastévere</a
						>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Back to home link -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each data.destinationActivities as activity (activity.id)}
			<ActivityCard
				item={activity}
				wrapperClass="border-b border-solid border-neutral-200 pb-4 sm:p-3 sm:border sm:rounded-xl"
			/>
		{/each}
	</div>

	<FaqsInline
		title={data.destination.faqsTitle}
		faqs={data.destination.faqs}
		wrapperClass="mt-12 lg:my-23"
	/>

	<ContentBlockStack
		title="Los mejores planes para descubrir {data.destination.name}"
		items={data.destination.contentBlockStack}
		wrapperClass="mt-12 mb-48 sm:mt-16 sm:mb-16 lg:mt-24 lg:mb-24"
	/>

	<NewsletterRegistration />
</div>
