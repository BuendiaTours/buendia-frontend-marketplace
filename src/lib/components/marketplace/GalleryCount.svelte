<script lang="ts">
	type Props = {
		count: string | number;
		wrapperClass?: string;
	};

	let { count, wrapperClass = 'right-3 bottom-3' }: Props = $props();
</script>

<div
	class="c-gallery-count bg-alpha-ink-84 pointer-events-none absolute rounded-lg border border-neutral-300 p-3 font-bold text-white {wrapperClass}"
>
	{count}
</div>
