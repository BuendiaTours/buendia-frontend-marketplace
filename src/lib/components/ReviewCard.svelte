<!--
	ReviewCard
	Variantes: wrapperClass="is-variant-vertical"
-->
<script lang="ts">
	import AuthorMeta from './AuthorMeta.svelte';
	import StarRating from './StarRating.svelte';
	import { clampText } from '$lib/actions/marketplace/clampText';

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
</script>

<div class="c-review-card group @container w-full {wrapperClass}">
	<div
		class="c-review-card__head flex flex-col gap-3 group-[.is-variant-vertical]:flex-col @[480px]:flex-row @[480px]:items-start @[480px]:justify-between"
	>
		<AuthorMeta {name} {desc} />
		{#if rating != null}
			<div
				class="c-review-card__rating flex shrink-0 items-center gap-2 group-[.is-variant-vertical]:order-[-1] group-[.is-variant-vertical]:mt-0 @[480px]:mt-3.5"
			>
				<StarRating value={rating} size="sm" />
				{#if showRatingValue}
					<span class="p-lg font-bold">{rating}</span>
				{/if}
			</div>
		{/if}
	</div>

	<p class="c-review-card__text p-base mt-3" use:clampText={{ lines, key: text }}>
		{text}
	</p>
</div>
