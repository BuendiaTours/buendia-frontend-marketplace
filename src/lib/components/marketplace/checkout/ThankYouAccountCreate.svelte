<script lang="ts">
	import { BuendiaLogoStar } from '$lib/icons/Linear';

	type Props = {
		title: string;
		description: string;
		buttonText: string;
		buttonClass?: string;
		slug: string;
		wrapperClass?: string;
	};

	let { title, description, buttonText, buttonClass, slug, wrapperClass }: Props = $props();
</script>

<div class="bg-info-100 border-info-300 rounded-2xl border border-solid px-5 py-9 {wrapperClass}">
	<div class="flex justify-between gap-4">
		<p class="h2 mb-3 text-neutral-800 sm:mb-2.5">
			{title}
		</p>
		<BuendiaLogoStar class="h-7 shrink-0 grow-0 basis-10" />
	</div>
	<div class="p-lg mb-5 text-neutral-700">
		{description}
	</div>
	<a href={slug} class="e-button {buttonClass}">
		{buttonText}
	</a>
</div>
