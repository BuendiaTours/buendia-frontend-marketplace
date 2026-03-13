<script lang="ts">
	import type { PageData } from './$types';
	import { resolveRoute } from '$app/paths';
	import Breadcrumb from '$lib/components/marketplace/Breadcrumbs.svelte';

	let { data }: { data: PageData } = $props();
</script>

<div class="wrapper">
	<div class="my-6">
		<Breadcrumb items={data.breadcrumbs} />
	</div>

	<!-- Location Info -->
	<div class="e-card mb-8">
		<h1 class="mb-4 font-bold text-gray-900">{data.location.name}</h1>
		{#if data.location.descriptionShort}
			<p class="text-gray-600">{data.location.descriptionShort}</p>
		{/if}
		{#if data.location.photoUrlHero}
			<div class="mt-4">
				<img
					src={data.location.photoUrlHero}
					alt={data.location.name}
					class="h-64 w-full rounded-lg object-cover"
				/>
			</div>
		{/if}
	</div>

	<!-- Categories List -->
	<div class="e-card mb-8">
		<h2 class="mb-4 font-semibold text-gray-800">Categorías</h2>

		{#if data.categories && data.categories.length > 0}
			<ul class="space-y-3">
				{#each data.categories as category (category.slug)}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- /categoria/[slug] route not yet created -->
					<li class="border-b border-gray-100 pb-3 last:border-b-0">
						<a
							href={`/categoria/${category.slug}`}
							class="block hover:text-blue-600 hover:underline"
						>
							{category.name}
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-gray-500">No hay categorías disponibles en esta ubicación.</p>
		{/if}
	</div>

	<!-- Activities List -->
	<div class="e-card mb-8">
		<h2 class="mb-4 font-semibold text-gray-800">
			Actividades en {data.location.name}
		</h2>

		{#if data.activities && data.activities.length > 0}
			<ul class="space-y-3">
				{#each data.activities as activity (activity.id)}
					<li class="border-b border-gray-100 pb-3 last:border-b-0">
						<a
							href={resolveRoute('/(marketplace)/actividad/[slug]', { slug: activity.slug })}
							class="block hover:text-blue-600 hover:underline"
						>
							<h3 class="font-medium text-gray-800">{activity.title}</h3>
							{#if activity.descriptionShort}
								<p class="mt-1 text-gray-600">{activity.descriptionShort}</p>
							{/if}
						</a>
					</li>
				{/each}
			</ul>

			<!-- Pagination info -->
			{#if data.pagination && data.pagination.total > data.pagination.pageSize}
				<div class="mt-4 text-center text-gray-600">
					Página {data.pagination.page} de {Math.ceil(
						data.pagination.total / data.pagination.pageSize
					)}
				</div>
			{/if}
		{:else}
			<p class="text-gray-500">No hay actividades disponibles en esta ubicación.</p>
		{/if}
	</div>

	<!-- Back to home link -->
</div>
