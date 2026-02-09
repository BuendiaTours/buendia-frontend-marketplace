<script lang="ts">
	/**
	 * StarRating Component
	 *
	 * Componente de valoración con estrellas que redondea automáticamente a medias estrellas.
	 *
	 * @example
	 * Uso básico:
	 * <StarRating value={4.2} />
	 *
	 * @example
	 * Con tamaño personalizado:
	 * <StarRating value={3.7} size="md" />
	 *
	 * ... etc
	 */

	interface Props {
		value: number | null;
		size?: 'xs' | 'sm' | 'md' | 'lg';
		filledClass?: string;
		emptyClass?: string;
	}

	let {
		value,
		size = 'xs',
		filledClass = '', // bg-orange-400
		emptyClass = '' // bg-base-300
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
				return 'rating-xs';
			case 'sm':
				return 'rating-sm';
			case 'md':
				return 'rating-md';
			case 'lg':
				return 'rating-lg';
			default:
				return 'rating-xs';
		}
	});
</script>

{#if value !== null}
	<div class="rating rating-half {sizeClass()}">
		{#each stars() as star, index}
			{#if star === 'full'}
				<div
					class="mask mask-star-2 mask-half-1 {filledClass}"
					aria-current={index * 2 + 1 === roundedRating() * 2 ? 'true' : undefined}
				></div>
				<div
					class="mask mask-star-2 mask-half-2 {filledClass}"
					aria-current={index * 2 + 2 === roundedRating() * 2 ? 'true' : undefined}
				></div>
			{:else if star === 'half'}
				<div class="mask mask-star-2 mask-half-1 {filledClass}" aria-current="true"></div>
				<div class="mask mask-star-2 mask-half-2 {emptyClass}"></div>
			{:else}
				<div class="mask mask-star-2 mask-half-1 {emptyClass}"></div>
				<div class="mask mask-star-2 mask-half-2 {emptyClass}"></div>
			{/if}
		{/each}
	</div>
{:else}
	<span class="text-sm">&mdash;</span>
{/if}
