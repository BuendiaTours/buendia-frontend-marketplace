<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import MeltPagination from '$lib/components/marketplace/MeltPagination.svelte';

	let { data }: { data: PageData } = $props();

	function handlePageChange(newPage: number) {
		const url = new URL($page.url);
		url.searchParams.set('page', newPage.toString());
		goto(url.toString());
	}
</script>

<div class="bnd-wrapper">
	<div class="my-6">
		<a href="/" class="text-blue-600 hover:underline">← Volver al inicio</a>
	</div>

	<!-- Destination Info -->
	<div class="bnd-card mb-8">
		<h1 class="mb-4 font-bold text-gray-900">{data.destination.name}</h1>
		{#if data.destination.descriptionShort}
			<p class="text-gray-600">{data.destination.descriptionShort}</p>
		{/if}
		{#if data.destination.photoUrlHero}
			<div class="mt-4">
				<img
					src={data.destination.photoUrlHero}
					alt={data.destination.name}
					class="h-64 w-full rounded-lg object-cover"
				/>
			</div>
		{/if}
	</div>

	<!-- Categories List -->
	<div class="bnd-card mb-8">
		<h2 class="mb-4 font-semibold text-gray-800">Categorías</h2>

		{#if data.categories && data.categories.length > 0}
			<ul class="space-y-3">
				{#each data.categories as category}
					<li class="border-b border-gray-100 pb-3 last:border-b-0">
						<a href="/categoria/{category.slug}" class="block hover:text-blue-600 hover:underline">
							{category.name}
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-gray-500">No hay categorías disponibles en este destino.</p>
		{/if}
	</div>

	<!-- Activities List -->
	<div class="bnd-card mb-8">
		<h2 class="mb-4 font-semibold text-gray-800">
			Actividades en {data.destination.name}
		</h2>

		{#if data.activities && data.activities.length > 0}
			<ul class="space-y-3">
				{#each data.activities as activity}
					<li class="border-b border-gray-100 pb-3 last:border-b-0">
						<a href="/actividad/{activity.slug}" class="block hover:text-blue-600 hover:underline">
							<h3 class="font-medium text-gray-800">{activity.title}</h3>
							{#if activity.descriptionShort}
								<p class="mt-1 text-gray-600">{activity.descriptionShort}</p>
							{/if}
						</a>
					</li>
				{/each}
			</ul>

			<!-- Pagination -->
			{#if data.pagination.totalPages > 1}
				<MeltPagination
					count={data.pagination.total}
					perPage={data.pagination.pageSize}
					onPageChange={handlePageChange}
				/>
			{/if}
		{:else}
			<p class="text-gray-500">No hay actividades disponibles en este destino.</p>
		{/if}
	</div>

	<!-- Back to home link -->
</div>
