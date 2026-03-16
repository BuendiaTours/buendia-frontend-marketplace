<!--
	ReviewCard
	Variantes: wrapperClass="is-variant-vertical"
-->
<script lang="ts">
	import AuthorMeta from './AuthorMeta.svelte';
	import StarRating from './StarRating.svelte';

	type Props = {
		name: string;
		desc?: string;
		rating?: number | null;
		text: string;
		lines?: number;
		showRatingValue?: boolean;
		wrapperClass?: string;
	};

	let {
		name,
		desc,
		rating,
		text,
		lines = 3,
		showRatingValue = true,
		wrapperClass = ''
	}: Props = $props();

	let expanded = $state(false);
	let textEl = $state<{ scrollHeight: number; clientHeight: number } | undefined>();
	let isClamped = $state(false);

	$effect(() => {
		if (textEl) {
			isClamped = textEl.scrollHeight > textEl.clientHeight;
		}
	});
</script>

<div class="c-review-card group w-full {wrapperClass}" style="--rc-lines: {lines}">
	<div
		class="c-review-card__head flex items-start justify-between gap-3 group-[.is-variant-vertical]:flex-col"
	>
		<AuthorMeta {name} {desc} />
		{#if rating != null}
			<div
				class="mt-3.5 flex shrink-0 items-center gap-2 group-[.is-variant-vertical]:order-[-1] group-[.is-variant-vertical]:mt-0"
			>
				<StarRating value={rating} size="sm" />
				{#if showRatingValue}
					<span class="p-lg font-bold">{rating}</span>
				{/if}
			</div>
		{/if}
	</div>

	<p bind:this={textEl} class="c-review-card__text p-base mt-3" class:is-expanded={expanded}>
		{text}
	</p>

	{#if isClamped || expanded}
		<button
			class="c-review-card__read-more p-sm mt-2 cursor-pointer border-b border-current leading-none font-medium"
			onclick={() => (expanded = !expanded)}
		>
			{expanded ? 'Leer menos' : 'Leer más'}
		</button>
	{/if}
</div>
