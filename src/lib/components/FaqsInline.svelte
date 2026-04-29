<script lang="ts">
	import FaqInlineItem from './FaqInlineItem.svelte';

	type Props = {
		title?: string | null;
		faqs: Array<{ id: string; position: number; question: string; answer: string; status: string }>;
		wrapperClass?: string;
	};

	let { title, faqs, wrapperClass }: Props = $props();

	const publishedFaqs = $derived(faqs?.filter((faq) => faq.status === 'PUBLISHED') ?? []);
	const sortedFaqs = $derived(publishedFaqs.slice().sort((a, b) => a.position - b.position));
</script>

<div class="c-faqs pb-1 {wrapperClass}">
	<h2 class="h2-editorial pb-5 text-neutral-800 lg:pb-6">
		{title}
	</h2>

	<div class="flex flex-col gap-7 sm:gap-9 lg:gap-12 lg:pt-6">
		{#each sortedFaqs as faq, i (faq.id)}
			<FaqInlineItem
				question={faq.question}
				answer={faq.answer}
				index={String(i + 1).padStart(2, '0')}
			/>
		{/each}
	</div>
</div>
