<script lang="ts">
	/**
	 * StarRating Component - Marketplace Version
	 *
	 * Componente de valoración con estrellas independiente de DaisyUI.
	 * Redondea automáticamente a medias estrellas.
	 *
	 * @example
	 * Uso básico:
	 * <StarRating value={4.2} />
	 *
	 * @example
	 * Con tamaño personalizado:
	 * <StarRating value={3.7} size="md" />
	 *
	 * @example
	 * Con clases de color personalizadas:
	 * <StarRating value={4.5} filledClass="c-star-filled" emptyClass="c-star-empty" />
	 */

	type Props = {
		value: number | null;
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		filledClass?: string;
		emptyClass?: string;
	};

	let {
		value,
		size = 'xs',
		filledClass = 'c-star-filled',
		emptyClass = 'c-star-empty'
	}: Props = $props();

	const roundedRating = $derived(() => {
		if (value === null) return 0;
		return Math.round(value * 2) / 2;
	});

	const stars = $derived(() => {
		const rating = roundedRating();
		const result: ('full' | 'half' | 'empty')[] = [];

		for (let i = 1; i <= 5; i++) {
			if (rating >= i) {
				result.push('full');
			} else if (rating >= i - 0.5) {
				result.push('half');
			} else {
				result.push('empty');
			}
		}

		return result;
	});

	const sizeClass = $derived(() => {
		switch (size) {
			case 'xs':
				return 'c-star-rating-xs';
			case 'sm':
				return 'c-star-rating-sm';
			case 'md':
				return 'c-star-rating-md';
			case 'lg':
				return 'c-star-rating-lg';
			case 'xl':
				return 'c-star-rating-xl';
			default:
				return 'c-star-rating-xs';
		}
	});
</script>

{#if value !== null}
	<div class="c-star-rating {sizeClass()}">
		{#each stars() as star, index (index)}
			{#if star === 'full'}
				<div
					class="c-mask c-mask-star c-mask-half-1 {filledClass}"
					aria-current={index * 2 + 1 === roundedRating() * 2 ? 'true' : undefined}
				></div>
				<div
					class="c-mask c-mask-star c-mask-half-2 {filledClass}"
					aria-current={index * 2 + 2 === roundedRating() * 2 ? 'true' : undefined}
				></div>
			{:else if star === 'half'}
				<div class="c-mask c-mask-star c-mask-half-1 {filledClass}" aria-current="true"></div>
				<div class="c-mask c-mask-star c-mask-half-2 {emptyClass}"></div>
			{:else}
				<div class="c-mask c-mask-star c-mask-half-1 {emptyClass}"></div>
				<div class="c-mask c-mask-star c-mask-half-2 {emptyClass}"></div>
			{/if}
		{/each}
	</div>
{:else}
	<span class="text-p-sm">&mdash;</span>
{/if}
