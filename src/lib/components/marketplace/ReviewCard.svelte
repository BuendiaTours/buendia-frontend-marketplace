<!--
	ReviewCard
	Variantes: wrapperClass="is-variant-vertical"
-->
<script lang="ts">
	import { untrack } from 'svelte';
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

	// Reset expanded when text changes (component is reused across reviews in lightbox)
	$effect(() => {
		const _text = text;
		untrack(() => {
			expanded = false;
		});
	});

	// ResizeObserver (en lugar de un $effect simple) re-evalúa cuando el elemento se hace visible
	// dentro de un lightbox o contenedor oculto. El rAF difiere la medición hasta que los @container
	// queries se resuelvan (necesitan dos pasadas de layout), evitando falsos positivos.
	$effect(() => {
		if (!textEl) return;
		let rafId: number;
		const observer = new ResizeObserver(() => {
			cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame(() => {
				if (textEl) isClamped = textEl.scrollHeight > textEl.clientHeight;
			});
		});
		observer.observe(textEl);
		return () => {
			observer.disconnect();
			cancelAnimationFrame(rafId);
		};
	});
</script>

<div class="c-review-card group @container w-full {wrapperClass}" style="--rc-lines: {lines}">
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
