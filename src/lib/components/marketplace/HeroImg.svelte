<script lang="ts">
	import type { ApiImage } from '$lib/types';

	type Props = {
		title?: string;
		imgObj?: Partial<ApiImage>;
		wrapperClass?: string;
	};

	let { title, imgObj, wrapperClass }: Props = $props();
</script>

{#if imgObj?.originalUrl}
	<div class="c-hero-img relative h-[196px] overflow-hidden rounded-xl sm:h-[314px] {wrapperClass}">
		<picture>
			{#if imgObj.variants?.find((v) => v.preset === '16_9')?.url}
				<source
					media="(max-width: 600px)"
					srcset={imgObj.variants?.find((v) => v.preset === '16_9')?.url}
				/>
			{/if}
			<img
				class="h-full w-full object-cover object-center"
				src={imgObj.variants?.find((v) => v.preset === 'HERO')?.url ?? imgObj.originalUrl}
				alt={imgObj.altText ?? ''}
			/>
		</picture>
		<div class="bg-alpha-ink-48 absolute inset-0"></div>
		{#if title}
			<div class="absolute inset-0 flex items-center justify-center">
				<h1 class="h1-editorial text-center text-white">{title}</h1>
			</div>
		{/if}
	</div>
{/if}
