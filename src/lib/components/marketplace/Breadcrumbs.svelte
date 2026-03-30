<!--
Componente Breadcrumb para el marketplace.

Responsabilidades:
1. Renderiza la navegación visual (Tailwind, sin DaisyUI)
2. Inyecta JSON-LD BreadcrumbList (schema.org) en <svelte:head> para SEO

El último item del array es la página actual (sin href, no linkeable).

Ejemplo de uso:
<Breadcrumb items={data.breadcrumbs} />

Ejemplo de items:
[
  { label: 'Inicio', href: '/' },
  { label: 'Barcelona', href: '/barcelona' },
  { label: 'Tour por el Barrio Gótico' }
]
-->

<script lang="ts">
	import { page } from '$app/state';
	import type { BreadcrumbItem } from '$lib/types';

	type Props = {
		items: BreadcrumbItem[];
	};

	let { items }: Props = $props();

	const jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: items.map((item, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: item.label,
				...(item.href ? { item: `${page.url.origin}${item.href}` } : {})
			}))
		}).replace(/<\/script>/gi, '<\\/script>')
	);

	let scriptTag = $derived(`<${'script'} type="application/ld+json">${jsonLd}</${'script'}>`);
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html scriptTag}
</svelte:head>
<nav aria-label="Breadcrumb">
	<ol class="p-base flex flex-wrap items-center gap-2 font-medium text-neutral-500">
		{#each items as item, index (index)}
			{#if index > 0}
				<li aria-hidden="true" class="select-none">/</li>
			{/if}
			<li>
				{#if item.href && index < items.length - 1}
					<a href={item.href} class="text-neutral-700 hover:text-gray-900 hover:underline"
						>{item.label}</a
					>
				{:else if index === items.length - 1}
					<span class="font-medium" aria-current="page">{item.label}</span>
				{:else}
					<span>{item.label}</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
