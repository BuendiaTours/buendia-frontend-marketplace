<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="b-wrapper mt-6">
	<div class="b-card mb-2 p-2 text-center">
		<h1 class="bg:var(--color-status-success-bg) mb-4 font-serif font-semibold text-gray-900">
			Home del Marketplace
		</h1>
		<p class="text-neutral-700">Página pública - Solo Tailwind CSS (sin DaisyUI)</p>
		<div>
			<div class="b-button">Button</div>
			<div class="b-button b-button-sm b-button-primary">Button</div>
			<div class="b-button b-button-lg">Button</div>
		</div>
		<div>
			<div class="b-button" disabled>Button</div>
			<div class="b-button b-button-sm b-button-primary" disabled>Button</div>
			<div class="b-button b-button-lg" disabled>Button</div>
		</div>
		<div>
			<div class="b-button b-button-secondary">Button</div>
			<div class="b-button b-button-secondary b-button-sm b-button-primary">Button</div>
			<div class="b-button b-button-secondary b-button-lg">Button</div>
		</div>
		<div>
			<div class="b-button b-button-secondary" disabled>Button</div>
			<div class="b-button b-button-secondary b-button-sm b-button-primary" disabled>Button</div>
			<div class="b-button b-button-secondary b-button-lg" disabled>Button</div>
		</div>
	</div>

	<div class="b-card mb-8">
		<h2 class="mb-3 font-semibold text-gray-800">Destinos</h2>

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

	<div class="b-card mb-8">
		<h2 class="mb-3 font-semibold text-gray-800">Free tours</h2>

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

	<div class="b-card mb-4">
		<h2 class="mb-3 font-semibold text-gray-800">Paid tours</h2>

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

	<div class="b-card mb-6">
		<h2 class="mb-3 font-semibold text-gray-800">Other tours</h2>

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
