<script lang="ts">
	import * as Icons from '$lib/icons/Linear';
	import type { Component } from 'svelte';
	import PureHtmlDialog from './PureHtmlDialog.svelte';

	type Condition = {
		icon?: string;
		title?: string;
		description?: string;
		descriptionColor?: string;
		boldTitle?: boolean;
		indent?: boolean;
		itsLevel?: boolean;
		baseIcon?: boolean;
		size?: 'normal' | 'small';
	};

	let pureDialog: PureHtmlDialog = $state() as PureHtmlDialog;

	let { data, wrapperClass }: { data: Condition; wrapperClass?: string } = $props();

	const IconComponent = $derived(
		data.icon ? (Icons[data.icon as keyof typeof Icons] as Component) : null
	);
	const descriptionColor = $derived(data.descriptionColor || 'text-neutral-700');
	const size = $derived(data.size ?? 'normal');
</script>

{#snippet descriptionParagraph()}
	<p class="{size === 'small' ? 'p-sm' : 'p-base'} {descriptionColor}">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- API content, sanitized server-side -->
		{@html data.description}
		{#if data.itsLevel}
			<button class="relative top-[2px] cursor-pointer" onclick={() => pureDialog.showModal()}>
				<Icons.InfoCircle class="h-4 w-4" />
			</button>
		{/if}
	</p>
{/snippet}

<div class="e-highlight flex flex-col gap-1">
	<div class="flex items-start gap-3 {wrapperClass}">
		{#if IconComponent}
			<div
				class="flex items-center justify-center {data.baseIcon
					? ''
					: 'rounded-lg border border-solid border-neutral-300 bg-white p-3'}"
			>
				<IconComponent class="h-6 shrink-0 grow-0 basis-6 text-neutral-800" />
			</div>
		{/if}
		<div class="flex flex-col self-center">
			{#if data.title}
				<p
					class="{size === 'small' ? 'p-base' : 'p-lg'} text-neutral-800 {data.boldTitle
						? 'font-bold'
						: ''}"
				>
					{data.title}
				</p>
			{/if}
			{#if data.description && !data.indent}
				{@render descriptionParagraph()}
			{/if}
		</div>
	</div>
	{#if data.description && data.indent}
		{@render descriptionParagraph()}
	{/if}
</div>

{#snippet levelRow(title: string, level: number, description: string)}
	<div>
		<p class="p-base flex justify-between gap-4 font-bold">{title} <span>{level}/5</span></p>
		<p class="p-sm mb-3 text-neutral-700">{description}</p>
		<div class="mt-1 grid grid-cols-5 gap-1">
			{#each Array(5) as _, i (i)}
				<div class="h-1 rounded-sm {i < level ? 'bg-violet-500' : 'bg-neutral-200'}"></div>
			{/each}
		</div>
	</div>
{/snippet}

{#if data.itsLevel}
	<PureHtmlDialog
		bind:this={pureDialog}
		title="Información de la actividad"
		titleClass="h3 py-1"
		dialogClass="w-full min-h-full sm:min-h-0 !max-h-full !max-w-160 sm:rounded-xl p-0 shadow-xl backdrop:bg-black/50"
	>
		{#snippet content()}
			<div class="flex flex-col gap-6 pb-5">
				{@render levelRow('Nivel bajo', 1, 'Paseo por ciudad.')}
				{@render levelRow('Nivel medio', 2, 'No requiere calzado deportivo.')}
				{@render levelRow(
					'Nivel medio-alto',
					3,
					'Excursión con cierta exigencia física. Recomendable calzado deportivo.'
				)}
				{@render levelRow(
					'Nivel alto',
					4,
					'Actividad físico-deportiva que requiere material deportivo.'
				)}
				{@render levelRow(
					'Nivel extremo',
					5,
					'Requiere ser experto en la actividad y saber utilizar material específico.'
				)}
			</div>
		{/snippet}
	</PureHtmlDialog>
{/if}
