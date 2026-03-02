<script lang="ts">
	// Componets
	import AccordionOnMobile from '$lib/components/marketplace/AccordionOnMobile.svelte';
	import StarRating from '$lib/components/marketplace/StarRating.svelte';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="wrapper mt-6">
	<StarRating value={3.5} size="md" filledClass="text-blue-500" emptyClass="text-blue-100" />
</div>

<div class="wrapper mt-6">
	<AccordionOnMobile open={true}>
		{#snippet summary()}
			<p class="h3">Información del producto</p>
		{/snippet}
		<p>Contenido visible siempre en desktop, colapsable en mobile.</p>
	</AccordionOnMobile>
</div>

<div class="wrapper mt-6">
	<div>
		<div class="e-button">Button</div>
		<div class="e-button e-button-sm e-button-primary">Button</div>
		<div class="e-button e-button-lg">Button</div>
	</div>
	<div>
		<div class="e-button" disabled>Button</div>
		<div class="e-button e-button-sm e-button-primary" disabled>Button</div>
		<div class="e-button e-button-lg" disabled>Button</div>
	</div>
	<div>
		<div class="e-button e-button-secondary">Button</div>
		<div class="e-button e-button-secondary e-button-sm e-button-primary">Button</div>
		<div class="e-button e-button-secondary e-button-lg">Button</div>
	</div>
	<div>
		<div class="e-button e-button-secondary" disabled>Button</div>
		<div class="e-button e-button-secondary e-button-sm e-button-primary" disabled>Button</div>
		<div class="e-button e-button-secondary e-button-lg" disabled>Button</div>
	</div>
	<div>
		<div class="e-button e-button-tertiary">Button</div>
		<div class="e-button e-button-tertiary e-button-sm e-button-primary">Button</div>
		<div class="e-button e-button-tertiary e-button-lg">Button</div>
	</div>
	<div>
		<div class="e-button e-button-tertiary" disabled>Button</div>
		<div class="e-button e-button-tertiary e-button-sm e-button-primary" disabled>Button</div>
		<div class="e-button e-button-tertiary e-button-lg" disabled>Button</div>
	</div>
</div>

<div class="wrapper mt-6">
	<div class="e-card mb-8">
		<h2 class="mb-3 font-semibold text-gray-800">Destinos</h2>

		{#if data.destinations && data.destinations.length > 0}
			<ul class="mt-4 space-y-2">
				{#each data.destinations as destination (destination.slug)}
					<li class="text-gray-700">
						<a href="/{destination.slug}" class="hover:text-blue-600 hover:underline">
							{destination.name}
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="mt-4 text-gray-500">No hay destinos disponibles en este momento.</p>
		{/if}
	</div>

	<div class="e-card mb-8">
		<h2 class="mb-3 font-semibold text-gray-800">Free tours</h2>

		{#if data.freeTours && data.freeTours.length > 0}
			<ul class="mt-4 space-y-2">
				{#each data.freeTours as activity (activity.slug)}
					<li class="text-gray-700">
						<a href="/actividad/{activity.slug}" class="hover:text-blue-600 hover:underline">
							{activity.title}
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="mt-4 text-gray-500">No hay free tours disponibles en este momento.</p>
		{/if}
	</div>

	<div class="e-card mb-4">
		<h2 class="mb-3 font-semibold text-gray-800">Paid tours</h2>

		{#if data.paidTours && data.paidTours.length > 0}
			<ul class="mt-4 space-y-2">
				{#each data.paidTours as activity (activity.slug)}
					<li class="text-gray-700">
						<a href="/actividad/{activity.slug}" class="hover:text-blue-600 hover:underline">
							{activity.title}
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="mt-4 text-gray-500">No hay paid tours disponibles en este momento.</p>
		{/if}
	</div>

	<div class="e-card mb-6">
		<h2 class="mb-3 font-semibold text-gray-800">Other tours</h2>

		{#if data.otherTours && data.otherTours.length > 0}
			<ul class="mt-4 space-y-2">
				{#each data.otherTours as activity (activity.slug)}
					<li class="text-gray-700">
						<a href="/actividad/{activity.slug}" class="hover:text-blue-600 hover:underline">
							{activity.title}
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="mt-4 text-gray-500">No hay other tours disponibles en este momento.</p>
		{/if}
	</div>
</div>
