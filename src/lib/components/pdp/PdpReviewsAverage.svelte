<script lang="ts">
	import type { ActivityReviewStats } from '$lib/types';
	import Progressbar from '$lib/components/Progressbar.svelte';
	import StarRating from '$lib/components/StarRating.svelte';

	type Props = {
		stats: ActivityReviewStats;
		activityTitle: string;
		onStarsChange: (stars: number[]) => void;
		wrapperClass?: string;
	};

	let { stats, activityTitle, onStarsChange, wrapperClass = '' }: Props = $props();

	let selectedStars = $state<number[]>([]);

	function handleCheckbox(star: number, checked: boolean) {
		if (checked) {
			selectedStars = [...selectedStars, star];
		} else {
			selectedStars = selectedStars.filter((s) => s !== star);
		}
		onStarsChange(selectedStars);
	}

	const sortedDistribution = $derived([...stats.distribution].sort((a, b) => b.stars - a.stars));
</script>

<div
	class="pdp-reviews-average flex flex-col items-center gap-4 rounded-xl border border-[var(--color-border-default)] p-6 sm:flex-row {wrapperClass}"
>
	<div class="pdp-reviews-average__left flex w-full flex-col items-center px-8 sm:w-1/2">
		<p class="pdp-reviews-average__score mb-2 text-[32px] font-bold">
			{stats.averageRating.toFixed(2)}
		</p>
		<StarRating value={stats.averageRating} size="xl" />
		<p class="pdp-reviews-average__label p-base mt-1 text-center font-bold">
			<strong>Según {stats.total} opiniones</strong> de {activityTitle}
		</p>
	</div>

	<div
		class="grid w-full grid-cols-[auto_1fr_auto_auto] items-center gap-y-3 pr-0 sm:w-1/2 sm:pr-10"
	>
		{#each sortedDistribution as item (item.stars)}
			<span class="p-sm whitespace-nowrap text-neutral-700">
				{item.stars === 1 ? '1 estrella' : `${item.stars} estrellas`}
			</span>
			<Progressbar percentage={String(item.percentage)} wrapperClass="ml-3" />
			<span class="p-sm ml-5 text-right tabular-nums">
				{item.count}
			</span>
			<div class="ml-3">
				<input
					type="checkbox"
					class="checkbox checkbox-sm"
					checked={selectedStars.includes(item.stars)}
					onchange={(e) => handleCheckbox(item.stars, e.currentTarget.checked)}
					aria-label={item.stars === 1 ? '1 estrella' : `${item.stars} estrellas`}
				/>
			</div>
		{/each}
	</div>
</div>
