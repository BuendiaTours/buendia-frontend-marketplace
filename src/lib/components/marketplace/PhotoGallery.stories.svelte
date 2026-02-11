<script context="module">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PhotoGallery from './PhotoGallery.svelte';

	const { Story } = defineMeta({
		title: 'Marketplace/Components/PhotoGallery',
		component: PhotoGallery,
		tags: ['autodocs'],
		argTypes: {
			images: {
				control: 'object',
				description: 'Array de imágenes con src, thumb, alt, width, height'
			}
		}
	});
</script>

<!--
	Stories del componente PhotoGallery
	Galería de imágenes con lightbox PhotoSwipe
-->

<!-- Galería con 3 imágenes -->
<Story
	name="Three Images"
	args={{
		images: [
			{
				src: 'https://images.unsplash.com/photo-1555881673-514222b14fb3?w=1200&q=80',
				thumb: 'https://images.unsplash.com/photo-1555881673-514222b14fb3?w=400&q=80',
				alt: 'Lisbon Traditional Food',
				width: 1200,
				height: 800
			},
			{
				src: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=80',
				thumb: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80',
				alt: 'Porto Wine Cellars',
				width: 1200,
				height: 800
			},
			{
				src: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80',
				thumb: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80',
				alt: 'Algarve Beach',
				width: 1200,
				height: 800
			}
		]
	}}
/>

<!-- Galería con muchas imágenes -->
<Story
	name="Six Images"
	args={{
		images: [
			{
				src: 'https://images.unsplash.com/photo-1555881673-514222b14fb3?w=1200&q=80',
				thumb: 'https://images.unsplash.com/photo-1555881673-514222b14fb3?w=400&q=80',
				alt: 'Image 1',
				width: 1200,
				height: 800
			},
			{
				src: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=80',
				thumb: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80',
				alt: 'Image 2',
				width: 1200,
				height: 800
			},
			{
				src: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80',
				thumb: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80',
				alt: 'Image 3',
				width: 1200,
				height: 800
			},
			{
				src: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80',
				thumb: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=400&q=80',
				alt: 'Image 4',
				width: 1200,
				height: 800
			},
			{
				src: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&q=80',
				thumb: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400&q=80',
				alt: 'Image 5',
				width: 1200,
				height: 800
			},
			{
				src: 'https://images.unsplash.com/photo-1581974206884-57e9c05d7c4d?w=1200&q=80',
				thumb: 'https://images.unsplash.com/photo-1581974206884-57e9c05d7c4d?w=400&q=80',
				alt: 'Image 6',
				width: 1200,
				height: 800
			}
		]
	}}
/>

<!-- Una sola imagen -->
<Story
	name="Single Image"
	args={{
		images: [
			{
				src: 'https://images.unsplash.com/photo-1555881673-514222b14fb3?w=1200&q=80',
				thumb: 'https://images.unsplash.com/photo-1555881673-514222b14fb3?w=400&q=80',
				alt: 'Lisbon Traditional Food',
				width: 1200,
				height: 800
			}
		]
	}}
/>

<!-- Estado vacío -->
<Story name="Empty" args={{ images: [] }} />
