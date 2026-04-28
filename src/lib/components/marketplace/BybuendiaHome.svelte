<script lang="ts">
	import * as Icons from '$lib/icons/Linear';
	import type { Component } from 'svelte';

	type Props = {
		title?: string;
		description?: string;
		wrapperClass?: string;
		items: Array<{
			icon: string;
			iconTitle: string;
			iconDescription: string;
			image: string;
			title: string;
			description: string;
		}>;
	};

	function getIcon(name: string): Component | null {
		return (Icons[name as keyof typeof Icons] as Component) ?? null;
	}

	let { wrapperClass, title, description, items }: Props = $props();
	const ByBuendia = Icons.ByBuendia;
</script>

<div>
	<div class="mb-1 flex gap-2">
		<ByBuendia class="h-6 shrink-0 grow-0 basis-6" />
		<p class="h3 text-neutral-800">Planes by buendía</p>
	</div>
	<div class="mb-6 flex flex-col gap-2">
		<h2 class="h2-editorial text-neutral-800">
			{title}
		</h2>
		<p class="p-lg text-neutral-700">
			{description}
		</p>
	</div>
	<div class="flex flex-col gap-5 lg:grid lg:grid-cols-3 lg:gap-6">
		{#each items as item, i (i)}
			{@const IconComponent = getIcon(item.icon)}
			<div class="flex flex-col overflow-hidden rounded-2xl border border-solid border-neutral-400">
				<div
					class="aspect-[358/320] bg-cover bg-center p-6 lg:aspect-[387/376] lg:p-8"
					style="background-image: url({item.image})"
				>
					<div
						class="flex items-center gap-3 rounded-2xl border border-solid border-neutral-400 bg-white p-4"
					>
						{#if IconComponent}
							<div
								class="flex h-12 shrink-0 grow-0 basis-12 items-center justify-center rounded-lg border border-solid border-violet-500 bg-neutral-800"
							>
								<IconComponent size={24} class="text-white" />
							</div>
						{/if}
						<div class="flex flex-col text-neutral-800">
							<p class="p-lg font-bold">
								{item.iconTitle}
							</p>
							<p class="p-base">
								{item.iconDescription}
							</p>
						</div>
					</div>
				</div>
				<div class="p-lg-editorial px-6 py-5 text-neutral-800 lg:py-6">
					<p class="font-bold">
						{item.title}
					</p>
					<p>
						{item.description}
					</p>
				</div>
			</div>
		{/each}
	</div>
</div>
