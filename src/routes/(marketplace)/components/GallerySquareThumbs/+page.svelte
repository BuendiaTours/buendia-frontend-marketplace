<script lang="ts">
	import GallerySquareThumbs from '$lib/components/marketplace/GallerySquareThumbs.svelte';
	import { ReviewsLayout } from '$lib/components/marketplace/BndLightbox';
	import type { BndLightboxItem } from '$lib/types';

	const photoItems: BndLightboxItem[] = [
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

	const galleryItems: BndLightboxItem[] = [
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

	const reviewItems: BndLightboxItem[] = demoReviews.flatMap((review, reviewIdx) =>
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
</script>

<!-- ============================================================ -->
<!-- GallerySquareThumbs — A. Fotos de actividad, todas visibles -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">GallerySquareThumbs A — fotos de actividad, todas visibles</h2>
	<p class="mb-6 text-gray-500">
		3 items, sin <code>visibleCount</code>. Todas las miniaturas aparecen en página.
	</p>
	<GallerySquareThumbs
		items={photoItems}
		categoryId="fotos"
		categoryLabel="Fotos de la actividad"
	/>
</div>

<!-- ============================================================ -->
<!-- GallerySquareThumbs — B. 12 items, visibleCount=3 -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">GallerySquareThumbs B — 12 items, solo 3 miniaturas visibles</h2>
	<p class="mb-6 text-gray-500">
		Galería de 12 fotos. <code>visibleCount=3</code> limita las miniaturas mostradas en página, pero el
		lightbox contiene los 12 items y permite navegar entre todos.
	</p>
	<GallerySquareThumbs
		items={galleryItems}
		visibleCount={3}
		categoryId="galeria"
		categoryLabel="Galería completa"
		thumbClass="w-48"
		wrapperClass="gap-4 @max-[400px]:flex-wrap"
	/>
</div>

<!-- ============================================================ -->
<!-- GallerySquareThumbs — C. Reviews con ReviewsLayout -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">GallerySquareThumbs C — reviews con ReviewsLayout</h2>
	<p class="mb-6 text-gray-500">
		Items de reviews con <code>layoutComponent={'{ReviewsLayout}'}</code>. El lightbox muestra la
		imagen junto a la información de la reseña (usuario, valoración, texto, fecha).
	</p>
	<GallerySquareThumbs
		items={reviewItems}
		categoryId="reviews"
		categoryLabel="Reviews de clientes"
		layoutComponent={ReviewsLayout}
	/>
</div>

<!-- ============================================================ -->
<!-- GallerySquareThumbs — D. Tamaño personalizado vía CSS custom property -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">GallerySquareThumbs D — tamaño personalizado</h2>
	<p class="mb-6 text-gray-500">
		Mismas fotos que A pero con <code>--gst-thumb-size: 4rem</code> y <code>--gst-gap: 0.5rem</code>
		aplicados mediante <code>wrapperClass</code> inline style en el wrapper externo.
	</p>
	<div style="--gst-thumb-size: 4rem; --gst-gap: 0.5rem;">
		<GallerySquareThumbs
			items={photoItems}
			categoryId="fotos-small"
			categoryLabel="Fotos (small)"
		/>
	</div>
</div>
