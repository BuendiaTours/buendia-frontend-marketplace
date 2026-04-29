<!--
	ReviewsLayout — layout for BndLightbox that shows an image alongside a review card.

	Receives `ctx: BndLightboxItemContext` where each item must follow this shape:

	{
	  src: string          // URL of the review image
	  alt?: string         // Accessible description of the image
	  meta: {
	    reviewId: string   // Review ID — used to fetch review data asynchronously
	  }
	}
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { format } from 'date-fns';

	// Types
	import type { ActivityReview, BndLightboxItemContext } from '$lib/types';

	// Componentes
	import ReviewCard from '$lib/components/ReviewCard.svelte';

	let { ctx }: { ctx: BndLightboxItemContext } = $props();

	// Copias locales que se muestran — se actualizan solo cuando el contenido está invisible
	let displayedSrc = $state(untrack(() => ctx.item.src));
	let displayedAlt = $state(untrack(() => ctx.item.alt));
	let reviewData = $state<ActivityReview | null>(null);

	// Un solo booleano controla opacity de imagen y review conjuntamente
	let contentVisible = $state(true);

	let initialized = false;

	$effect(() => {
		const newSrc = ctx.item.src; // dependencia reactiva
		const newAlt = ctx.item.alt;
		const reviewId = typeof ctx.item.meta?.reviewId === 'string' ? ctx.item.meta.reviewId : null;

		let aborted = false;

		untrack(() => {
			if (!initialized) {
				// Primer render: mostrar imagen de inmediato y fetchear review en background
				initialized = true;
				if (reviewId) {
					fetch(`/api/review/${reviewId}`)
						.then((r) => r.json())
						.then((data) => {
							if (!aborted) reviewData = data;
						})
						.catch(() => {});
				}
				return;
			}

			// Navegación: fade-out, esperar imagen + review, fade-in
			contentVisible = false;

			const fadeOutDone = new Promise<void>((r) => setTimeout(r, 210));
			const imageLoaded = new Promise<void>((r) => {
				const img = new Image();
				img.onload = () => r();
				img.onerror = () => r();
				img.src = newSrc;
			});
			const reviewFetched: Promise<ActivityReview | null> = reviewId
				? fetch(`/api/review/${reviewId}`)
						.then((r) => r.json())
						.catch(() => null)
				: Promise.resolve(null);

			Promise.all([fadeOutDone, imageLoaded, reviewFetched]).then(([, , review]) => {
				if (aborted) return;
				displayedSrc = newSrc;
				displayedAlt = newAlt;
				reviewData = review;
				contentVisible = true;
			});
		});

		// Cleanup: si el usuario navega rápido, cancelamos la promesa pendiente
		return () => {
			aborted = true;
		};
	});
</script>

<!-- Mobile: relative container, imagen llena el ancho, review fija al fondo -->
<!-- Desktop: flex centrado, imagen + review lado a lado -->
<div
	class="bnd-lightbox__review-wrapper relative h-full content-center sm:flex sm:items-center sm:justify-center sm:p-8"
>
	<div
		class="bnd-lightbox__review-container sm:flex sm:max-h-full sm:flex-col sm:gap-4 lg:flex-row lg:items-start lg:gap-6"
	>
		<!-- Imagen: opacity controlada por contentVisible, sin {#key} ni transition -->
		<div class="bnd-lightbox__review-image sm:min-w-0 lg:flex-1">
			<img
				src={displayedSrc}
				alt={displayedAlt ?? ''}
				class="w-full object-contain transition-opacity duration-200 sm:max-h-[85dvh] lg:max-h-[calc(100dvh-12rem)] 2xl:max-h-[calc(100dvh-24rem)]"
				class:opacity-0={!contentVisible}
			/>
		</div>

		<!-- Datos de la review: absolute al fondo en mobile, columna en tablet, fila en desktop -->
		<div
			class="bnd-lightbox__review-review absolute right-0 bottom-0 left-0 bg-[rgba(255,255,255,0.8)] pt-4 pr-4 pb-4 pl-4 sm:static sm:w-full sm:bg-transparent sm:pt-0 sm:pr-0 sm:pb-0 sm:pl-0 lg:w-80"
		>
			{#if reviewData}
				<div class="pt-4 transition-opacity duration-200" class:opacity-0={!contentVisible}>
					<ReviewCard
						name={reviewData.user || 'Anónimo'}
						desc={reviewData.createdAt
							? format(new Date(reviewData.createdAt), 'dd/MM/yyyy')
							: undefined}
						rating={reviewData.averageRating}
						text={reviewData.content ?? ''}
						lines={6}
					/>
				</div>
			{/if}
		</div>
	</div>
</div>
