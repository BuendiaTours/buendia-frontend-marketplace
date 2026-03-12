<script lang="ts">
	type Props = {
		count: string | number;
		wrapperClass?: string;
	};

	let { count, wrapperClass = '' }: Props = $props();
</script>

<div
	class="bg-alpha-ink-84 pointer-events-none absolute right-3 bottom-3 rounded-lg border border-neutral-300 p-3 font-bold text-white {wrapperClass}"
>
	{count}
</div>
