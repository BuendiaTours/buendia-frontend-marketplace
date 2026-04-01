<script lang="ts">
	import SvelteMarkdown from '@humanspeak/svelte-markdown';

	type Props = {
		question?: string;
		answer?: string;
		index?: string;
	};

	let { question, answer, index }: Props = $props();
</script>

<details
	class="c-faq-item flex flex-col gap-7 pb-6 sm:gap-9 sm:pb-7 lg:grid lg:grid-cols-[516fr_580fr] lg:items-start lg:gap-12 lg:pb-8"
	open
>
	<summary class="pointer-events-none flex w-full cursor-pointer justify-between gap-3">
		<h3
			class="faq-question color-neutral-800 h3-editorial flex flex-grow-0 basis-full flex-wrap justify-start gap-3 text-left font-bold"
		>
			{#if index}
				<span class="h2 shrink grow-0 basis-full !font-black text-neutral-500 lg:block">
					{index}
				</span>
			{/if}
			{question}
		</h3>
	</summary>
	{#if answer}
		<div
			class="p-base-editorial text-neutral-700 [&_a]:text-neutral-700 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-neutral-900 [&_p:not(:last-child)]:pb-2 [$_a]:font-bold"
		>
			<SvelteMarkdown source={answer} />
		</div>
	{/if}
</details>
