<script lang="ts">
	import FaqItem from './FaqItem.svelte';

	type Props = {
		title?: string | null;
		faqs: Array<{ id: string; position: number; question: string; answer: string }>;
	};

	let { title, faqs }: Props = $props();

	let showAll = $state(false);

	const sortedFaqs = $derived(faqs?.slice().sort((a, b) => a.position - b.position) ?? []);
	const visibleFaqs = $derived(showAll ? sortedFaqs : sortedFaqs.slice(0, 4));
</script>

<div class="c-faqs mb-2 pt-2 pb-4">
	<p class="h2 py-4">
		{title}
	</p>

	<ul>
		{#each visibleFaqs as faq (faq.id)}
			<FaqItem question={faq.question} answer={faq.answer} />
		{/each}
	</ul>

	{#if sortedFaqs.length > 4 && !showAll}
		<button
			class="mt-4 cursor-pointer font-bold text-neutral-800 underline underline-offset-8"
			onclick={() => (showAll = true)}
		>
			Ver más
		</button>
	{/if}
</div>
