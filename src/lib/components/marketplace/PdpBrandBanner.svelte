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

<div class="pdp-brand-banner mb-12 sm:mb-16 {wrapperClass}">
	<div class="bg-ochre-softer flex flex-col rounded-xl p-5 sm:flex-row lg:p-6">
		<img
			class="mb-4 w-full sm:mb-0 sm:w-xs sm:self-center lg:order-1 lg:w-[372px]"
			src={image}
			alt={imageAlt}
		/>
		<div class="p-3 sm:ml-4 sm:grow-0 sm:basis-full sm:self-center lg:order-0">
			<p class="h2-editorial mb-5 text-neutral-800 lg:mr-auto lg:mb-6 lg:ml-auto lg:max-w-[628px]">
				{title}
			</p>
			<p
				class="p-lg-editorial mb-5 font-medium text-neutral-800 lg:mr-auto lg:mb-6 lg:ml-auto lg:max-w-[628px]"
			>
				{description}
			</p>
			<div
				class="pdp-brand-banner-footer flex items-center justify-between lg:mr-auto lg:ml-auto lg:max-w-[628px]"
			>
				<div class="mt-[5px] h-px shrink-0 grow-0 basis-[80%] bg-black lg:basis-[90%]"></div>
				<img src="/marketplace/buendia-logo-small.svg" alt="by-buendia" />
			</div>
		</div>
	</div>
</div>

<style>
	.pdp-brand-banner img {
		border-radius: var(--radius-lg);
	}
</style>
