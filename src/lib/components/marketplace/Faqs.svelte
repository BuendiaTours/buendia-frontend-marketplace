<script lang="ts">
	import FaqItem from './FaqItem.svelte';

	type Props = {
		title?: string | null;
		faqs: Array<{ id: string; position: number; question: string; answer: string; status: string }>;
		wrapperClass?: string;
	};

	let { title, faqs, wrapperClass }: Props = $props();

	let showAll = $state(false);

	const publishedFaqs = $derived(faqs?.filter((faq) => faq.status === 'PUBLISHED') ?? []);
	const sortedFaqs = $derived(publishedFaqs.slice().sort((a, b) => a.position - b.position));
	const visibleFaqs = $derived(showAll ? sortedFaqs : sortedFaqs.slice(0, 4));
</script>

<div class="c-faqs pb-1 {wrapperClass}">
	<p class="h2 pb-4">
		{title}
	</p>

	<div>
		{#each visibleFaqs as faq (faq.id)}
			<FaqItem question={faq.question} answer={faq.answer} />
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
