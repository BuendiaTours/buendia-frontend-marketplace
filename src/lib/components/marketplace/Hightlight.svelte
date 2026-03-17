<script lang="ts">
	import * as Icons from '$lib/icons/Linear';
	import type { Component } from 'svelte';
	import MeltDrawer from './MeltDrawer.svelte';

	type Condition = {
		icon?: string;
		title?: string;
		description?: string;
		descriptionColor?: string;
		wrappedClass?: string;
		itsLevel?: boolean;
	};

	let { data }: { data: Condition } = $props();
	let drawerOpen = $state(false);

	const IconComponent = $derived(
		data.icon ? (Icons[data.icon as keyof typeof Icons] as Component) : null
	);
	const descriptionColor = $derived(data.descriptionColor || 'text-neutral-700');
</script>

<div class="flex items-start gap-3 {data.wrappedClass}">
	{#if IconComponent}
		<div
			class="flex items-center justify-center rounded-lg border border-solid border-neutral-300 bg-white p-3"
		>
			<IconComponent class="h-6 shrink-0 grow-0 basis-6 text-neutral-800" />
		</div>
	{/if}
	<div class="flex flex-col self-center">
		{#if data.title}
			<p class="p-lg font-bold text-neutral-800">
				{data.title}
			</p>
		{/if}
		{#if data.description}
			<p class="p {descriptionColor}">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- API content, sanitized server-side -->
				{@html data.description}
				{#if data.itsLevel}
					<button class="relative top-[2px] cursor-pointer" onclick={() => (drawerOpen = true)}>
						<Icons.InfoCircle class="h-4 w-4" />
					</button>
				{/if}
			</p>
		{/if}
	</div>
</div>

{#if data.itsLevel}
	<MeltDrawer
		bind:open={drawerOpen}
		title="Niveles de actividad"
		config={{ side: 'right', width: 400 }}
	>
		<div class="flex flex-col gap-4">
			<div>
				<p class="h3">Nivel bajo <span>1/5</span></p>
				<p class="p">Paseo por ciudad.</p>
			</div>
			<div>
				<p class="h3">Nivel medio<span>2/5</span></p>
				<p class="p">No requiere calzado deportivo.</p>
			</div>
			<div>
				<p class="h3">Nivel medio-alto<span>3/5</span></p>
				<p class="p">Excursión con cierta exigencia física. Recomendable calzado deportivo.</p>
			</div>
			<div>
				<p class="h3">Nivel alto<span>4/5</span></p>
				<p class="p">Actividad físico-deportiva que requiere material deportivo.</p>
			</div>
			<div>
				<p class="h3">Nivel extremo<span>5/5</span></p>
				<p class="p">Requiere ser experto en la actividad y saber utilizar material específico.</p>
			</div>
		</div>
	</MeltDrawer>
{/if}
