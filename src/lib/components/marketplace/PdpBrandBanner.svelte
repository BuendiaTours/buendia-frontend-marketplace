<script lang="ts">
	type Props = {
		title?: string;
		description?: string;
		image?: string;
		imageAlt?: string;
		wrapperClass?: string;
	};

	let { title, description, image, imageAlt, wrapperClass }: Props = $props();
</script>

<div
	class="pdp-brand-banner bg-ochre-softer flex flex-col gap-4 rounded-xl p-5 sm:flex-row lg:p-6 {wrapperClass}"
>
	<div
		class="pdp-brand-banner__img mb-4 aspect-square w-full shrink-1 overflow-hidden rounded-lg sm:mb-0 sm:shrink-0 md:max-w-[300px] md:sm:self-center lg:order-1 lg:max-w-[372px]"
	>
		<img class="h-full w-full object-cover" src={image} alt={imageAlt} loading="lazy" />
	</div>
	<div class="pdp-brand-banner__text-content self-center px-3 py-3 lg:order-0 xl:px-18">
		<p class="h2-editorial mb-5 text-neutral-800 lg:mr-auto lg:mb-6 lg:ml-auto">
			{title}
		</p>
		<p class="p-lg-editorial mb-5 font-medium text-neutral-800 lg:mr-auto lg:mb-6 lg:ml-auto">
			{description}
		</p>
		<div class="pdp-brand-banner__footer flex items-center justify-between lg:mr-auto lg:ml-auto">
			<div class="mt-1 h-px shrink-0 grow-0 basis-[80%] bg-black lg:basis-[90%]"></div>
			<img src="/marketplace/buendia-logo-small.svg" alt="by Buendía" loading="lazy" />
		</div>
	</div>
</div>
