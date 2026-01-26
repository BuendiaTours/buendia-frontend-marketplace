<script lang="ts">
	import type { Destination } from '$lib/types';
	import { page } from '$app/stores';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction } from '$lib/actions/confirmAction';

	let { data }: { data: { destination: Destination } } = $props();
	const { destination } = data;
</script>

<svelte:head>
	<title>{destination.name} - Destinos</title>
</svelte:head>

<div class="mb-4 flex items-center justify-between">
	<a href={`/destinations?${$page.url.searchParams.toString()}`} class="link">
		← Volver al listado
	</a>

	<form
		method="POST"
		action={buildUrlWithFilters(`/destinations/${destination.slug}/delete`, $page.url.searchParams)}
		use:confirmAction={{
			title: 'Eliminar destino',
			message: '¿Seguro que quieres eliminar este destino?',
			confirmText: 'Eliminar',
			cancelText: 'Cancelar',
			danger: true
		}}
	>
		<button type="submit" class="btn btn-soft btn-error">Delete</button>
	</form>
</div>

<h1 class="mb-6 text-3xl font-bold">{destination.name}</h1>

<div class="grid gap-6 md:grid-cols-2">
	<div class="card bg-base-200">
		<div class="card-body">
			<h2 class="card-title">Información básica</h2>
			<div class="space-y-2">
				<div>
					<span class="font-semibold">ID:</span>
					<span class="ml-2 text-sm text-base-content/70">{destination.id}</span>
				</div>
				<div>
					<span class="font-semibold">Nombre:</span>
					<span class="ml-2">{destination.name}</span>
				</div>
				<div>
					<span class="font-semibold">Slug:</span>
					<span class="ml-2 text-sm text-base-content/70">{destination.slug}</span>
				</div>
				<div>
					<span class="font-semibold">Tipo:</span>
					<span class="ml-2 badge badge-primary">
						{destination.kind === 'CITY'
							? 'Ciudad'
							: destination.kind === 'REGION'
								? 'Región'
								: 'País'}
					</span>
				</div>
			</div>
		</div>
	</div>

	<div class="card bg-base-200">
		<div class="card-body">
			<h2 class="card-title">Descripción</h2>
			<p class="text-base-content/80">{destination.descriptionShort}</p>
		</div>
	</div>

	<div class="card bg-base-200 md:col-span-2">
		<div class="card-body">
			<h2 class="card-title">Imagen Hero</h2>
			<div class="flex items-center gap-4">
				<img
					src={destination.photoUrlHero}
					alt={destination.name}
					class="h-48 w-auto rounded-lg object-cover"
				/>
				<div class="text-sm text-base-content/70">
					<p class="font-semibold">URL:</p>
					<a href={destination.photoUrlHero} target="_blank" rel="noopener noreferrer" class="link">
						{destination.photoUrlHero}
					</a>
				</div>
			</div>
		</div>
	</div>
</div>

<div class="mt-6 flex justify-end gap-2">
	<a href={`/destinations/${destination.slug}/edit`} class="btn btn-primary">Editar destino</a>
</div>

<h2 class="mt-8">JSON de la API</h2>
<pre class="overflow-x-auto rounded-box bg-base-200 p-4 text-xs">{JSON.stringify(
		destination,
		null,
		2
	)}</pre>
