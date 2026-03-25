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
		<img
			class="h-full w-full object-cover object-center"
			src={imgObj.variants?.find((v) => v.preset === 'HERO')?.url ?? imgObj.originalUrl}
			alt={imgObj.altText ?? ''}
		/>
		<div class="bg-alpha-ink-48 absolute inset-0"></div>
		{#if title}
			<div class="absolute inset-0 flex items-center justify-center">
				<h1 class="h1-editorial text-center text-white">{title}</h1>
			</div>
		{/if}
	</div>
{/if}
