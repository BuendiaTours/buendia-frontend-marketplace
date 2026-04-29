<script lang="ts">
	type Props = {
		wrapperClass?: string;
		title?: string;
		description?: string;
		buttonText?: string;
		slug?: string;
		image_1?: string;
		image_2?: string;
	};

	let { wrapperClass, title, description, buttonText, slug, image_1, image_2 }: Props = $props();
</script>

<div class="{wrapperClass} lg:flex lg:items-center lg:gap-8">
	<div class="mb-6 flex flex-col items-start gap-5 text-neutral-800 lg:mb-0 lg:gap-6">
		<img src="marketplace/buendia-logo-small.svg" alt="logo" class="w-15" />
		{#if title}
			<h2 class="h2-editorial">
				{title}
			</h2>
		{/if}
		{#if description}
			<p class="p-lg">
				{description}
			</p>
		{/if}
		{#if buttonText && slug}
			<a href={slug} class="e-button e-button-secondary">
				{buttonText}
			</a>
		{/if}
	</div>
	<div class="grid grid-cols-2 gap-3 sm:gap-4 lg:shrink-0 lg:grow-0 lg:basis-[66.226%]">
		<img loading="lazy" src={image_1} alt="tienda" class="h-full w-full rounded-2xl object-cover" />
		<img loading="lazy" src={image_2} alt="tienda" class="h-full w-full rounded-2xl object-cover" />
	</div>
</div>
