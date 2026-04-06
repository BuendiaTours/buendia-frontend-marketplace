<script lang="ts">
	import type { PlpAttractionItem } from '$lib/types';

	type Props = {
		item: PlpAttractionItem;
	};

	let { item }: Props = $props();
</script>

<img
	src={item.image}
	alt={item.title}
	class="absolute inset-0 -z-1 h-full w-full object-cover opacity-52"
/>
<div class="flex h-full w-full flex-col p-6">
	<h3 class="h1-editorial text-white">
		{item.title}
	</h3>

	<div class="flex flex-[0_1_100%] items-end justify-between">
		<div class="h3 text-white">
			<p>
				{item.activities}
				{item.activities === 1 ? 'actividad' : 'actividades'}
			</p>
			<p>
				desde {item.price}€
			</p>
		</div>
		<a href={item.slug} class="e-button e-button-tertiary"> Ver actividad </a>
	</div>
</div>
