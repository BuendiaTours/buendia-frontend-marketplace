<script lang="ts">
	const LABELS: Record<number, string> = {
		5: 'Excelente',
		4: 'Muy bueno',
		3: 'Regular',
		2: 'Malo',
		1: 'Pésimo'
	};

	type Props = {
		score: number;
		stars?: number;
		full?: boolean;
	};

	let { score, stars, full }: Props = $props();

	const label = $derived(stars != null ? (LABELS[stars] ?? '') : '');
</script>

<a
	href="https://es.trustpilot.com/review/buendiatours.com"
	target="_blank"
	rel="noopener noreferrer"
	class="flex items-center {full ? 'gap-2.5' : 'gap-1.5'}"
>
	{#if label}
		<span class="p-base hidden font-semibold text-neutral-200 lg:block">{label}</span>
	{/if}
	{#if full}
		<div class="flex gap-0.5">
			{#each { length: 5 } as _, i (i)}
				{@const fillPct = Math.round(Math.min(100, Math.max(0, (score - i) * 100)))}
				<div
					class="relative flex h-[23px] w-[23px] items-center justify-center overflow-hidden rounded-xs bg-[#DCDCE6] before:absolute before:inset-0 before:w-[var(--fill)] before:bg-[#00b67a] before:content-['']"
					style="--fill: {fillPct}%"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						class="relative z-10"
					>
						<path
							d="M7.875 12.125L11.2969 11.2L12.7266 15.9L7.875 12.125ZM15.75 6.05H9.72656L7.875 0L6.02344 6.05H0L4.875 9.8L3.02344 15.85L7.89844 12.1L10.8984 9.8L15.75 6.05Z"
							fill="white"
						/>
					</svg>
				</div>
			{/each}
		</div>
		<div class="p-base text-neutral-200">
			{score.toFixed(1)} <span class="hidden lg:inline-block">de 5 en</span>
		</div>
	{:else}
		<span class="p-base text-neutral-200">{score.toFixed(1)} sobre 5</span>
	{/if}
	<img
		src="/marketplace/footer/trust.svg"
		class={full ? '' : '-mt-1'}
		alt="Trustpilot"
		loading="lazy"
	/>
</a>
