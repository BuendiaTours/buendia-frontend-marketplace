<script lang="ts">
	import * as Icons from '$lib/icons/Linear';
	import type { Component } from 'svelte';

	type Props = {
		item: {
			icon?: string;
			title: string;
			description: string;
		};
	};

	let { item }: Props = $props();
	const IconComponent = $derived(
		item.icon ? (Icons[item.icon as keyof typeof Icons] as Component) : null
	);
</script>

<div class="rounded-xl border border-solid border-neutral-400 px-6 py-7 lg:py-12">
	{#if item.icon}
		<IconComponent class="mb-2 size-10" />
	{:else}
		<!-- TrustBox widget - Flex -->
		<div
			class="trustpilot-widget -mt-[10px] -ml-[14px] w-[242px]"
			data-locale="es-ES"
			data-template-id="54197383fd9dceac42a68694"
			data-businessunit-id="6875230edd0a4c4d3e408b7c"
			data-style-width="100%"
			data-style-size="S"
			data-token="08cc50a3-de8e-4d60-9be4-0a0dec539623"
			data-text-color="dark"
			data-headline="star"
			data-support-text="review-number"
			data-background="none"
			data-external-elements-color="dark"
		>
			<a
				href="https://es.trustpilot.com/review/buendiatours.tp-testing.com"
				target="_blank"
				rel="noopener noreferrer">Trustpilot</a
			>
		</div>
		<!-- End TrustBox widget -->
	{/if}
	<h3 class="h3-editorial mb-2 text-neutral-800">
		{item.title}
	</h3>
	<div class="p-sm-editorial text-neutral-800">
		{item.description}
	</div>
</div>
