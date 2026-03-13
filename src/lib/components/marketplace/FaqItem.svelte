<script lang="ts">
	import { Plus, Minus } from '$lib/icons/Linear';
	type Props = {
		question?: string;
		answer?: string;
	};

	let { question, answer }: Props = $props();
	let active = $state(false);
</script>

<li class="c-faq-item py-4">
	<button
		class="flex w-full cursor-pointer justify-between gap-3"
		type="button"
		onclick={() => (active = !active)}
	>
		<h3
			class="faq-question p-lg color-neutral-800 flex flex-grow-0 basis-full justify-start gap-3 text-left font-bold"
		>
			{question}
		</h3>
		{#if active}
			<Minus class="size-6 flex-shrink-0 flex-grow-0 basis-6" />
		{:else}
			<Plus class="size-6 flex-shrink-0 flex-grow-0 basis-6" />
		{/if}
	</button>
	<div
		class="p pt-2 text-neutral-700 [&_a]:text-neutral-700 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-neutral-900 [&_p:not(:last-child)]:pb-2 [$_a]:font-bold"
		class:hidden={!active}
	>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html answer}
	</div>
</li>
