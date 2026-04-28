<script lang="ts">
	import { DangerTriangle } from '$lib/icons/Linear';
	import type { Snippet } from 'svelte';

	type Props = {
		icon?: Snippet;
		title: string;
		message: string;
		technicalDetails?: Record<string, unknown>;
		showTechnicalDetails?: boolean;
		actions?: Snippet;
	};

	let {
		icon,
		title,
		message,
		technicalDetails,
		showTechnicalDetails = true,
		actions
	}: Props = $props();
</script>

<div class="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
	<div class="text-error-500">
		{#if icon}
			{@render icon()}
		{:else}
			<DangerTriangle width={64} height={64} />
		{/if}
	</div>

	<div class="max-w-md space-y-2">
		<h1 class="h1">{title}</h1>
		<p class="p-base">{message}</p>
	</div>

	{#if actions}
		<div class="flex flex-wrap justify-center gap-3">
			{@render actions()}
		</div>
	{/if}

	{#if showTechnicalDetails && technicalDetails}
		<details class="max-w-2xl text-left">
			<summary class="cursor-pointer text-neutral-500" style="font-size: var(--font-size-p-sm)">
				Detalles técnicos
			</summary>
			<pre
				class="mt-2 rounded-lg bg-neutral-100 p-4 text-neutral-700"
				style="font-size: var(--font-size-p-sm)">{JSON.stringify(technicalDetails, null, 2)}</pre>
		</details>
	{/if}
</div>
