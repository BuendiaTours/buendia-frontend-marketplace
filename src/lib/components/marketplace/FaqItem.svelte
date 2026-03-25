<script lang="ts">
	import { Plus, Minus } from '$lib/icons/Linear';
	import SvelteMarkdown from '@humanspeak/svelte-markdown';

	type Props = {
		question?: string;
		answer?: string;
		fullOpened?: boolean;
		index?: string;
	};

	let { question, answer, fullOpened = false, index }: Props = $props();

	const itemClass = $derived(
		fullOpened
			? 'full-opened gap-7 sm:gap-9 flex flex-col pb-6 sm:pb-7 lg:grid lg:grid-cols-[516fr_580fr] lg:gap-12 lg:items-start lg:pb-8'
			: 'py-4'
	);
	const counterClass = $derived(fullOpened ? 'h2 shrink grow-0 basis-full !font-black' : 'hidden');
	const questionClass = $derived(fullOpened ? 'flex-wrap h3-editorial' : 'p-lg');
</script>

<details class="c-faq-item {itemClass}" open={fullOpened}>
	<summary
		class="flex w-full cursor-pointer justify-between gap-3"
		class:pointer-events-none={fullOpened}
	>
		<h3
			class="faq-question color-neutral-800 flex flex-grow-0 basis-full justify-start gap-3 text-left font-bold {questionClass}"
		>
			{#if index}
				<span class="text-neutral-500 lg:block {counterClass}">
					{index}
				</span>
			{/if}
			{question}
		</h3>
		{#if !fullOpened}
			<Plus class="icon-plus size-6 flex-shrink-0 flex-grow-0 basis-6" />
			<Minus class="icon-minus size-6 flex-shrink-0 flex-grow-0 basis-6" />
		{/if}
	</summary>
	<div
		class="p-base-editorial text-neutral-700 [&_a]:text-neutral-700 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-neutral-900 [&_p:not(:last-child)]:pb-2 [$_a]:font-bold"
		class:pt-2={!fullOpened}
	>
		<SvelteMarkdown source={answer} />
	</div>
</details>
