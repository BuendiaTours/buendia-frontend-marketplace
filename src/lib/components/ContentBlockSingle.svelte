<script lang="ts">
	import { clampText } from '$lib/actions/clampText';

	type Props = {
		title: string;
		description: string;
		image: string;
		wrapperClass?: string;
	};

	let { title, description, image, wrapperClass = '' }: Props = $props();
</script>

<div class="text-neutral-800 {wrapperClass}">
	<h2 class="h2-editorial mb-5">{title}</h2>
	<div class="flex flex-col gap-7 sm:flex-row sm:items-start sm:gap-8">
		<div class="flex flex-col items-start">
			<div
				class="p-editorial mb-3 lg:[&_p]:mb-8"
				use:clampText={{
					lines: 10,
					readMore: 'Ver más',
					readLess: 'Ocultar',
					buttonClass: 'p-base font-bold text-neutral-800 underline underline-offset-4'
				}}
			>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- API content, sanitized server-side -->
				{@html description}
			</div>
		</div>
		<div class="aspect-[580/366] sm:flex-[0_0_358px] lg:flex-[0_0_580px]">
			<img src={image} alt={title} class="h-full w-full rounded-xl object-cover" />
		</div>
	</div>
</div>
