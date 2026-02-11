<script context="module">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ActivityCard from './ActivityCard.svelte';

	const { Story } = defineMeta({
		title: 'Marketplace/Components/ActivityCard',
		component: ActivityCard,
		tags: ['autodocs'],
		argTypes: {
			activity: {
				control: 'object',
				description: 'Objeto con datos de la actividad'
			}
		}
	});
</script>

<!--
	Stories del componente ActivityCard
	Muestra diferentes estados y variaciones del componente
-->

<!-- Historia por defecto -->
<Story
	name="Default"
	args={{
		activity: {
			id: '1',
			title: 'Lisbon Food Tour',
			description:
				'Experience authentic Portuguese cuisine through the historic streets of Lisbon. Visit traditional markets, taste local delicacies, and learn about Portuguese food culture.',
			price: 89,
			location: 'Lisbon, Portugal',
			image: 'https://images.unsplash.com/photo-1555881673-514222b14fb3?w=800&q=80'
		}
	}}
/>

<!-- Sin imagen -->
<Story
	name="Without Image"
	args={{
		activity: {
			id: '2',
			title: 'Porto Wine Tasting',
			description: 'Discover the world-famous Port wine cellars and taste exquisite vintages.',
			price: 65,
			location: 'Porto, Portugal'
		}
	}}
/>

<!-- Precio premium -->
<Story
	name="Premium Experience"
	args={{
		activity: {
			id: '3',
			title: 'Private Yacht Sunset Cruise',
			description:
				'Exclusive private yacht experience along the stunning Algarve coast. Includes gourmet dinner and champagne.',
			price: 450,
			location: 'Algarve, Portugal',
			image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80'
		}
	}}
/>

<!-- Descripción larga -->
<Story
	name="Long Description"
	args={{
		activity: {
			id: '4',
			title: 'Sintra Palaces Full Day Tour',
			description:
				'Visit the fairy-tale palaces and romantic gardens of Sintra in this comprehensive full-day tour. Explore Pena Palace, Quinta da Regaleira, and the historic town center. Learn about Portuguese history and architecture from an expert local guide. Includes transportation from Lisbon, entrance fees, and a traditional Portuguese lunch.',
			price: 120,
			location: 'Sintra, Portugal',
			image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80'
		}
	}}
/>

<!-- Precio económico -->
<Story
	name="Budget Friendly"
	args={{
		activity: {
			id: '5',
			title: 'Alfama Walking Tour',
			description: 'Discover the historic Alfama neighborhood with a local guide.',
			price: 25,
			location: 'Lisbon, Portugal',
			image: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&q=80'
		}
	}}
/>
