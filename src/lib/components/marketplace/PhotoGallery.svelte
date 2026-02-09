<script lang="ts">
	import { photoswipeGallery } from '$lib/actions/marketplace/photoswipeGallery';

	type GalleryImage = {
		src: string;
		thumb: string;
		alt: string;
		width: number;
		height: number;
	};

	let { images }: { images: GalleryImage[] } = $props();
</script>

<!--
	PhotoGallery - Marketplace
	
	Componente de galería de imágenes con lightbox PhotoSwipe
	para la parte pública del marketplace.
	
	@param images - Array de imágenes con src, thumb, alt, width, height
	
	@example
	```svelte
	<script>
	  import PhotoGallery from '$lib/components/marketplace/PhotoGallery.svelte';
	  
	  const images = [
	    {
	      src: '/images/activity-1-large.jpg',
	      thumb: '/images/activity-1-thumb.jpg',
	      alt: 'Lisbon Food Tour',
	      width: 1200,
	      height: 800
	    }
	  ];
	</script>
	
	<PhotoGallery {images} />
	```
-->

<div class="gallery-grid" use:photoswipeGallery>
	{#each images as image}
		<a
			href={image.src}
			data-pswp-width={image.width}
			data-pswp-height={image.height}
			target="_blank"
			rel="noreferrer"
			class="gallery-item"
		>
			<img src={image.thumb} alt={image.alt} class="gallery-image" />
		</a>
	{/each}
</div>

<style>
	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
	}

	.gallery-item {
		position: relative;
		display: block;
		overflow: hidden;
		border-radius: 8px;
		aspect-ratio: 4/3;
		cursor: pointer;
		transition: transform 0.2s ease;
	}

	.gallery-item:hover {
		transform: scale(1.02);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.gallery-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
