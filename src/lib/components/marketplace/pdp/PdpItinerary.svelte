<script lang="ts">
	import StageItem from '../StageItem.svelte';
	import { AltArrowDown } from '$lib/icons/Linear';

	type Props = {
		title?: string;
		items?: Array<{
			id: string;
			order: number;
			name: string;
			description?: string;
			kind: string;
			duration?: string;
		}>;
		wrapperClass?: string;
	};

	let { title, wrapperClass, items }: Props = $props();

	const sorted = $derived((items ?? []).toSorted((a, b) => a.order - b.order));
</script>

<details open class="stages-cnt">
	<summary
		class="flex cursor-pointer items-center justify-between py-4 lg:pointer-events-none lg:cursor-default"
	>
		<h2 class="h2 text-neutral-800">
			{title}
		</h2>
		<AltArrowDown class="shrink-0 grow-0 basis-6 lg:hidden" />
	</summary>
	<div class="stages flex flex-col gap-3">
		{#each sorted as item, i (item.id)}
			<StageItem
				name={item.name}
				description={item.description}
				kind={item.kind}
				duration={item.duration}
				index={i}
				total={sorted.length}
			/>
		{/each}
	</div>
</details>
