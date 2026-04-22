<script lang="ts">
	type Props = {
		score: number;
	};

	let { score }: Props = $props();
</script>

<a
	href="https://es.trustpilot.com/review/buendiatours.com"
	target="_blank"
	rel="noopener noreferrer"
	class="flex items-center gap-1.5"
>
	<span class="p-base text-neutral-200">{score.toFixed(1)} sobre 5</span>
	<img src="/marketplace/footer/trust_star.svg" class="-mt-1" alt="Trustpilot" loading="lazy" />
	<span class="p-trustpilot text-white">Trustpilot</span>
</a>
