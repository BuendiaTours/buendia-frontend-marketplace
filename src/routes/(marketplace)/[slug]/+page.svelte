<script lang="ts">
	import type { PageData } from './$types';

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
	import { page } from '$app/stores';

	let { data }: { data: PageData } = $props();
</script>

<div class="wrapper">
	<div class="my-6">
		<Breadcrumb items={data.breadcrumbs} />
	</div>

	<HeroImg imgObj={data.destination.image} title={`Qué hacer en ${data.destination.name}`} />

	<!-- Activities grid -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each data.activities as activity (activity.id)}
			<ActivityCard
				item={activity}
				wrapperClass="border-b border-solid border-neutral-200 pb-4 sm:p-3 sm:border sm:rounded-xl"
			/>
		{/each}
	</div>

	<!-- Pagination -->
	{#if data.pagination && data.pagination.totalPages > 1}
		<div class="mt-6 flex justify-center gap-4">
			{#if data.pagination.page > 1}
				<a
					href="{$page.url.pathname}?page={data.pagination.page - 1}"
					class="rounded border px-4 py-2 hover:bg-neutral-100"
				>
					Anterior
				</a>
			{/if}
			<span class="flex items-center text-sm text-neutral-600">
				Página {data.pagination.page} de {data.pagination.totalPages}
			</span>
			{#if data.pagination.page < data.pagination.totalPages}
				<a
					href="{$page.url.pathname}?page={data.pagination.page + 1}"
					class="rounded border px-4 py-2 hover:bg-neutral-100"
				>
					Siguiente
				</a>
			{/if}
		</div>
	{/if}

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
