<script lang="ts">
	import FaqItem from './FaqItem.svelte';

	type Props = {
		title?: string | null;
		faqs: Array<{ id: string; position: number; question: string; answer: string; status: string }>;
		wrapperClass?: string;
		fullOpened?: boolean;
	};

	let { title, faqs, wrapperClass, fullOpened = false }: Props = $props();

	// svelte-ignore state_referenced_locally
	let showAll = $state(fullOpened ? true : false);

	const publishedFaqs = $derived(faqs?.filter((faq) => faq.status === 'PUBLISHED') ?? []);
	const sortedFaqs = $derived(publishedFaqs.slice().sort((a, b) => a.position - b.position));
	const visibleFaqs = $derived(showAll ? sortedFaqs : sortedFaqs.slice(0, 4));
	const titleClass = $derived(fullOpened ? 'h2-editorial pb-5 lg:pb-6' : 'h2 pb-4');
</script>

<div class="c-faqs pb-1 {wrapperClass}">
	<h2 class="text-neutral-800 {titleClass}">
		{title}
	</h2>

	<div
		class:flex={fullOpened}
		class:flex-col={fullOpened}
		class:gap-7={fullOpened}
		class:sm:gap-9={fullOpened}
		class:lg:gap-12={fullOpened}
		class:lg:pt-6={fullOpened}
	>
		{#each visibleFaqs as faq, i (faq.id)}
			<FaqItem
				question={faq.question}
				answer={faq.answer}
				{fullOpened}
				index={String(i + 1).padStart(2, '0')}
			/>
		{/each}
	</div>

	{#if sortedFaqs.length > 4 && !showAll}
		<button
			class="mt-4 cursor-pointer font-bold text-neutral-800 underline underline-offset-8"
			onclick={() => (showAll = true)}
		>
			Ver más
		</button>
	{/if}
</div>
