<!--
	ReviewsLayout — layout for BndLightbox that shows an image alongside a review card.

	Receives `ctx: BndLightboxItemContext` where each item must follow this shape:

	{
	  src: string          // URL of the review image
	  alt?: string         // Accessible description of the image
	  meta: {
	    user:    string    // Reviewer name
	    date:    string    // Display date, e.g. "12 marzo 2026"
	    rating:  number    // Score 1–5
	    content: string    // Review body text
	  }
	}
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import type { BndLightboxItemContext } from '$lib/types';
	import ReviewCard from '$lib/components/marketplace/ReviewCard.svelte';

	let { ctx }: { ctx: BndLightboxItemContext } = $props();

	// Copias locales que se muestran — se actualizan solo cuando el contenido está invisible
	let displayedSrc = $state(ctx.item.src);
	let displayedAlt = $state(ctx.item.alt);
	let displayedMeta: typeof ctx.item.meta = $state(ctx.item.meta);

	// Un solo booleano controla opacity de imagen y review conjuntamente
	let contentVisible = $state(true);

	$effect(() => {
		const newSrc = ctx.item.src; // dependencia reactiva
		const newMeta = ctx.item.meta; // dependencia reactiva
		const newAlt = ctx.item.alt;

		let aborted = false;

		untrack(() => {
			// Skip en el primer render (valores iguales a los iniciales)
			if (newSrc === displayedSrc && newMeta === displayedMeta) return;

			// Fase 1: fade-out
			contentVisible = false;

			// Fase 2: esperar fade-out Y preload de imagen (lo que tarde más)
			const fadeOutDone = new Promise<void>((r) => setTimeout(r, 210)); // 200ms + buffer
			const imageLoaded = new Promise<void>((r) => {
				const img = new Image();
				img.onload = () => r();
				img.onerror = () => r(); // no bloqueamos si falla
				img.src = newSrc;
			});

			Promise.all([fadeOutDone, imageLoaded]).then(() => {
				if (aborted) return;
				// Fase 3: swap de contenido + fade-in
				displayedSrc = newSrc;
				displayedAlt = newAlt;
				displayedMeta = newMeta;
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
			{#if displayedMeta}
				<div class="pt-4 transition-opacity duration-200" class:opacity-0={!contentVisible}>
					<ReviewCard
						name={displayedMeta.user || 'Anónimo'}
						desc={String(displayedMeta.date ?? '')}
						rating={Number(displayedMeta.rating)}
						text={String(displayedMeta.content ?? '')}
						lines={6}
					/>
				</div>
			{/if}
		</div>
	</div>
</div>
