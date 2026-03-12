<script lang="ts">
	import AuthorMeta from './AuthorMeta.svelte';
	import StarRating from './StarRating.svelte';

	type Props = {
		name: string;
		desc?: string;
		rating: number | null;
		text: string;
		lines?: number;
		layout?: 'a' | 'b';
		showRatingValue?: boolean;
		wrapperClass?: string;
	};

	let {
		name,
		desc,
		rating,
		text,
		lines = 3,
		layout = 'a',
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

<div class="c-review-card w-full {wrapperClass}" style="--rc-lines: {lines}">
	{#if layout === 'a'}
		<!-- Layout A: AuthorMeta left, StarRating right -->
		<div class="flex items-start justify-between gap-4">
			<AuthorMeta {name} {desc} />
			<div class="mt-1 flex shrink-0 items-center gap-2">
				<StarRating value={rating} size="sm" />
				{#if showRatingValue && rating !== null}
					<span class="p-lg font-bold">{rating}</span>
				{/if}
			</div>
		</div>
	{:else}
		<!-- Layout B: StarRating above, AuthorMeta below -->
		<div class="mb-2 flex items-center gap-2">
			<StarRating value={rating} size="sm" />
			{#if showRatingValue && rating !== null}
				<span class="p-lg font-bold">{rating}</span>
			{/if}
		</div>
		<div>
			<AuthorMeta {name} {desc} />
		</div>
	{/if}

	<p bind:this={textEl} class="c-review-card__text p-base mt-3" class:is-expanded={expanded}>
		{text}
	</p>

	{#if isClamped || expanded}
		<button
			class="p-sm mt-2 cursor-pointer border-b border-current leading-none font-medium"
			onclick={() => (expanded = !expanded)}
		>
			{expanded ? 'Leer menos' : 'Leer más'}
		</button>
	{/if}
</div>
