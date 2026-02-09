<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="mx-auto max-w-4xl px-4 py-16">
	<div class="mb-8 rounded-lg bg-blue-50 p-8 text-center">
		<h1 class="mb-4 text-4xl font-bold text-gray-900">Home del Marketplace</h1>
		<p class="text-lg text-gray-600">Página pública - Solo Tailwind CSS (sin DaisyUI)</p>
	</div>

	<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<h2 class="mb-3 text-2xl font-semibold text-gray-800">Destinos</h2>

		{#if data.destinations && data.destinations.length > 0}
			<ul class="mt-4 space-y-2">
				{#each data.destinations as destination}
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

	<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<h2 class="mb-3 text-2xl font-semibold text-gray-800">Free tours</h2>

		{#if data.freeTours && data.freeTours.length > 0}
			<ul class="mt-4 space-y-2">
				{#each data.freeTours as activity}
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

	<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<h2 class="mb-3 text-2xl font-semibold text-gray-800">Paid tours</h2>

		{#if data.paidTours && data.paidTours.length > 0}
			<ul class="mt-4 space-y-2">
				{#each data.paidTours as activity}
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

	<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<h2 class="mb-3 text-2xl font-semibold text-gray-800">Other tours</h2>

		{#if data.otherTours && data.otherTours.length > 0}
			<ul class="mt-4 space-y-2">
				{#each data.otherTours as activity}
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
