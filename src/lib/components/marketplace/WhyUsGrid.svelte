<script lang="ts">
	import WhyUsItem from './WhyUsItem.svelte';

	type Props = {
		data: {
			id?: string;
			icon?: string;
			title: string;
			description: string;
		}[];
		wrapperClass?: string;
	};

	let { data, wrapperClass }: Props = $props();
</script>

<div class={wrapperClass}>
	<h2 class="h2-editorial mb-5">Qué nos diferencia</h2>
	<div class="grid grid-cols-1 gap-4 xl:grid-cols-[1.001fr_1fr_1fr_1fr]">
		{#each data as item, i (i)}
			<WhyUsItem {item} />
		{/each}
	</div>
</div>
