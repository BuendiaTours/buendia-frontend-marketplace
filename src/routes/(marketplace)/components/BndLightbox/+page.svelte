<script lang="ts">
	import {
		BndLightbox,
		ReviewsLayout,
		bndLightboxAction
	} from '$lib/components/marketplace/BndLightbox';
	import type { BndLightboxConfig, BndLightboxItemContext } from '$lib/types';
	import { fade } from 'svelte/transition';

	// Fotos compartidas (usadas en ejemplos A, B y D)
	const photoItems = [
		{
			src: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=80',
			alt: 'Porto Wine Cellars',
			title: 'Bodegas de Oporto'
		},
		{
			src: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80',
			alt: 'Algarve Beach',
			title: 'Playa del Algarve'
		},
		{
			src: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=1200&q=80',
			alt: 'Cosmetics',
			title: 'Selección de cosméticos'
		}
	];

	// Raw reviews data (estructura real de la API)
	type RawReview = {
		user: string;
		averageRating: number;
		content: string;
		date?: string;
		createdAt?: string;
		attachments: Array<{ url: { value: string }; mimeType?: string | null }>;
	};

	const demoReviews: RawReview[] = [
		{
			user: 'María García',
			averageRating: 5,
			content: 'Una experiencia increíble. La comida estaba deliciosa y el guía fue muy ameno.',
			date: '2025-11-15',
			attachments: [
				{
					url: { value: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80' }
				},
				{
					url: { value: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&q=80' }
				}
			]
		},
		{
			user: 'JSmith Buyer',
			averageRating: 4,
			content: 'Great product overall. Minor issue with the instructions, they could be clearer.',
			createdAt: '2026-01-25T18:22:30.000Z',
			attachments: [
				{ url: { value: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=1200&q=80' } }
			]
		}
	];

	// Normalización flat: cada attachment → BndLightboxItem con datos de review en meta
	const reviewItems = demoReviews.flatMap((review, reviewIdx) =>
		review.attachments.map((att) => ({
			src: att.url.value,
			alt: `Foto de ${review.user}`,
			meta: {
				user: review.user,
				rating: review.averageRating,
				content: review.content,
				date: review.date ?? review.createdAt?.split('T')[0] ?? '',
				reviewIndex: reviewIdx
			}
		}))
	);

	// A — Botón → default layout, sin tabs
	let lbA_open = $state(false);
	const lbA_config: BndLightboxConfig = {
		wrapAround: true,
		categories: [{ id: 'fotos', label: 'Fotos', items: photoItems }]
	};

	// B — Thumbnails → default layout, sin tabs
	let lbB_open = $state(false);
	let lbB_startIndex = $state(0);

	// C — Botón → ReviewsLayout (componente), sin tabs
	let lbC_open = $state(false);
	const lbC_config: BndLightboxConfig = {
		wrapAround: true,
		categories: [
			{ id: 'reviews', label: 'Reviews', items: reviewItems, layoutComponent: ReviewsLayout }
		]
	};

	// D — Thumbnails de reviews → ReviewsLayout + tabs (fotos + reviews)
	let lbD_open = $state(false);
	let lbD_startIndex = $state(0);
	const lbD_config: BndLightboxConfig = {
		wrapAround: true,
		categories: [
			{ id: 'fotos', label: 'Fotos de la actividad', items: photoItems },
			{
				id: 'reviews',
				label: 'Reviews de los clientes',
				items: reviewItems,
				layoutComponent: ReviewsLayout
			}
		]
	};

	function openLbD(index: number) {
		lbD_startIndex = index;
		lbD_open = true;
	}

	// E — Snippet custom inline (one-off)
	let lbE_open = $state(false);

	// G — 3 thumbnails → galería de 12 items (solo los 3 primeros tienen miniatura en página)
	let lbG_open = $state(false);
	let lbG_startIndex = $state(0);
	const lbG_items = [
		// Los 3 primeros tienen miniatura visible en página
		{
			src: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=80',
			alt: 'Porto Wine Cellars',
			title: 'Bodegas de Oporto'
		},
		{
			src: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80',
			alt: 'Algarve Beach',
			title: 'Playa del Algarve'
		},
		{
			src: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=1200&q=80',
			alt: 'Cosmetics',
			title: 'Selección de cosméticos'
		},
		// Items 4–12: solo visibles en la lightbox
		{
			src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80',
			alt: 'Watch',
			title: 'Reloj de pared'
		},
		{
			src: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&q=80',
			alt: 'Polaroid',
			title: 'Fotografía polaroid'
		},
		{
			src: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=1200&q=80',
			alt: 'Sneakers',
			title: 'Zapatillas de colección'
		},
		{
			src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
			alt: 'Mountain',
			title: 'Cumbre nevada'
		},
		{
			src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
			alt: 'Forest',
			title: 'Bosque en otoño'
		},
		{
			src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
			alt: 'Forest path',
			title: 'Sendero del bosque'
		},
		{
			src: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=1200&q=80',
			alt: 'Sunrise',
			title: 'Amanecer en la costa'
		},
		{
			src: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80',
			alt: 'Aerial view',
			title: 'Vista aérea'
		},
		{
			src: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80',
			alt: 'Travel',
			title: 'En camino'
		}
	];
	const lbE_config: BndLightboxConfig = {
		wrapAround: true,
		categories: [{ id: 'custom', label: 'Custom', items: photoItems }]
	};
</script>

<!-- ============================================================ -->
<!-- BndLightbox — A. Botón → default layout, sin tabs -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">BndLightbox A — default layout, desde botón</h2>
	<p class="mb-6 text-gray-500">
		Layout por defecto (imagen + pie de foto). Una sola categoría, sin tabs. Se abre desde un botón.
	</p>
	<button class="e-button e-button-primary" onclick={() => (lbA_open = true)}>
		Abrir galería
	</button>
	<BndLightbox bind:open={lbA_open} config={lbA_config}>
		{#snippet cta()}
			<div class="justify-center p-4 text-center">
				<a href="/producto" class="e-button e-button-primary e-button-sm">Ver producto</a>
			</div>
		{/snippet}
	</BndLightbox>
</div>

<!-- ============================================================ -->
<!-- BndLightbox — B. Thumbnails → default layout, sin tabs -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">BndLightbox B — default layout, desde miniaturas</h2>
	<p class="mb-6 text-gray-500">
		Igual que A pero con grid de miniaturas. Click en una imagen abre el lightbox en ese índice.
	</p>
	<div class="grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
		{#each photoItems as item, i (item.src)}
			<button
				onclick={() => {
					lbB_startIndex = i;
					lbB_open = true;
				}}
				aria-label={item.alt}
				class="relative block aspect-[4/3] cursor-pointer overflow-hidden rounded-lg border-none bg-none p-0 transition-transform duration-200 ease-in-out hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
			>
				<img
					src={item.src.replace('w=1200', 'w=400')}
					alt={item.alt}
					class="h-full w-full object-cover"
				/>
			</button>
		{/each}
	</div>
	<BndLightbox bind:open={lbB_open} config={{ ...lbA_config, startIndex: lbB_startIndex }} />
</div>

<!-- ============================================================ -->
<!-- BndLightbox — C. Botón → ReviewsLayout (componente), sin tabs -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">BndLightbox C — ReviewsLayout, desde botón</h2>
	<p class="mb-6 text-gray-500">
		Layout de reviews importado como componente reutilizable (<code>ReviewsLayout</code>). Sin tabs.
		Se abre desde un botón.
	</p>
	<button class="e-button e-button-primary" onclick={() => (lbC_open = true)}>
		Abrir reviews
	</button>
	<BndLightbox bind:open={lbC_open} config={lbC_config} />
</div>

<!-- ============================================================ -->
<!-- BndLightbox — D. Thumbnails reviews → ReviewsLayout + tabs (fotos + reviews) -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">BndLightbox D — ReviewsLayout + tabs, desde miniaturas</h2>
	<p class="mb-6 text-gray-500">
		Dos categorías con tabs: "Fotos" (default layout) y "Reviews" (ReviewsLayout). Click en
		miniatura abre en la tab reviews en el índice correcto. En desktop: botones; mobile: select.
	</p>
	<div class="flex flex-wrap gap-3">
		{#each reviewItems as item, i (item.src)}
			<button
				type="button"
				onclick={() => openLbD(i)}
				aria-label={String(item.meta?.user ?? '')}
				class="relative block aspect-square w-24 cursor-pointer overflow-hidden rounded-md border-none bg-none p-0"
			>
				<img
					src={item.src.replace('w=1200', 'w=200')}
					alt={item.alt}
					class="h-full w-full object-cover"
				/>
			</button>
		{/each}
	</div>
	<BndLightbox
		bind:open={lbD_open}
		config={{ ...lbD_config, startCategory: 'reviews', startIndex: lbD_startIndex }}
	/>
</div>

<!-- ============================================================ -->
<!-- BndLightbox — E. Snippet custom inline (one-off) -->
<!-- ============================================================ -->

<!-- Snippet definido antes del componente para poder pasarlo como prop -->
{#snippet customLayout(ctx: BndLightboxItemContext)}
	<div class="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
		{#key ctx.item.src}
			<img
				src={ctx.item.src}
				alt={ctx.item.alt ?? ''}
				class="max-h-[50vh] max-w-full rounded-2xl object-contain shadow-2xl"
				transition:fade={{ duration: 300 }}
			/>
		{/key}
		{#if ctx.item.title}
			<div class="space-y-1">
				<p class="text-2xl font-bold text-white">{ctx.item.title}</p>
				<p class="text-sm text-white/50">{ctx.index + 1} / {ctx.total}</p>
			</div>
		{/if}
	</div>
{/snippet}

<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">BndLightbox E — snippet custom inline (one-off)</h2>
	<p class="mb-6 text-gray-500">
		Layout completamente personalizado definido con <code>{'{#snippet}'}</code> en la propia página y
		pasado como prop. Demuestra el poder del API de snippets para casos únicos.
	</p>
	<button class="e-button e-button-primary" onclick={() => (lbE_open = true)}>
		Abrir layout custom
	</button>
	<BndLightbox
		bind:open={lbE_open}
		config={{ ...lbE_config, categories: [{ ...lbE_config.categories[0], layout: customLayout }] }}
	/>
</div>

<!-- ============================================================ -->
<!-- BndLightbox — F. use:bndLightboxAction (sin config manual) -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">BndLightbox F — <code>use:bndLightboxAction</code></h2>
	<p class="mb-6 text-gray-500">
		Sin <code>&lt;BndLightbox&gt;</code> en el template. La action escanea el contenedor, construye
		el config automáticamente a partir de <code>data-bndlb-*</code> y monta el lightbox al hacer
		click. Las imágenes con la misma <code>data-bndlb-category</code> generan tabs.
	</p>

	<div
		use:bndLightboxAction={{ wrapAround: true, showTitle: true }}
		class="grid gap-3"
		style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));"
	>
		<img
			src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80"
			alt="Porto Wine Cellars"
			data-bndlb-src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=80"
			data-bndlb-title="Bodegas de Oporto"
			data-bndlb-category="exterior"
			data-bndlb-category-label="Exterior"
			class="aspect-[4/3] w-full rounded-lg object-cover"
		/>
		<img
			src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80"
			alt="Algarve Beach"
			data-bndlb-src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80"
			data-bndlb-title="Playa del Algarve"
			data-bndlb-category="exterior"
			data-bndlb-category-label="Exterior"
			class="aspect-[4/3] w-full rounded-lg object-cover"
		/>
		<img
			src="https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80"
			alt="Cosmetics"
			data-bndlb-src="https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=1200&q=80"
			data-bndlb-title="Selección de cosméticos"
			data-bndlb-category="interior"
			data-bndlb-category-label="Interior"
			class="aspect-[4/3] w-full rounded-lg object-cover"
		/>
		<img
			src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"
			alt="Watch"
			data-bndlb-src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80"
			data-bndlb-title="Reloj de pared"
			data-bndlb-category="interior"
			data-bndlb-category-label="Interior"
			class="aspect-[4/3] w-full rounded-lg object-cover"
		/>
		<img
			src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80"
			alt="Polaroid"
			data-bndlb-src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&q=80"
			data-bndlb-title="Fotografía polaroid"
			data-bndlb-category="interior"
			data-bndlb-category-label="Interior"
			class="aspect-[4/3] w-full rounded-lg object-cover"
		/>
		<img
			src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&q=80"
			alt="Sneakers"
			data-bndlb-src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=1200&q=80"
			data-bndlb-title="Zapatillas de colección"
			data-bndlb-category="exterior"
			data-bndlb-category-label="Exterior"
			class="aspect-[4/3] w-full rounded-lg object-cover"
		/>
	</div>
</div>

<!-- ============================================================ -->
<!-- BndLightbox — G. 3 thumbnails → galería de 12 items -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">BndLightbox G — 3 miniaturas, galería de 12 items</h2>
	<p class="mb-6 text-gray-500">
		Solo los 3 primeros items tienen miniatura visible. Click en cualquiera abre el lightbox con los
		12 items. Los restantes 9 son accesibles navegando dentro de la galería.
	</p>
	<div class="grid gap-4" style="grid-template-columns: repeat(3, 1fr);">
		{#each lbG_items.slice(0, 3) as item, i (item.src)}
			<button
				type="button"
				onclick={() => {
					lbG_startIndex = i;
					lbG_open = true;
				}}
				aria-label={item.alt}
				class="relative block aspect-[4/3] cursor-pointer overflow-hidden rounded-lg border-none bg-none p-0 transition-transform duration-200 ease-in-out hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
			>
				<img
					src={item.src.replace('w=1200', 'w=400')}
					alt={item.alt}
					class="h-full w-full object-cover"
				/>
				<span class="p-xs absolute right-2 bottom-2 rounded bg-black/60 px-2 py-0.5 text-white">
					{i + 1} / {lbG_items.length}
				</span>
			</button>
		{/each}
	</div>
	<BndLightbox
		bind:open={lbG_open}
		config={{
			wrapAround: true,
			categories: [{ id: 'galeria', label: 'Galería', items: lbG_items }],
			startIndex: lbG_startIndex
		}}
	/>
</div>
