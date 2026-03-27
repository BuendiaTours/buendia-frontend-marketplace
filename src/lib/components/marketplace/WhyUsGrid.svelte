<script lang="ts">
	import WhyUsItem from './WhyUsItem.svelte';

	type Props = {
		wrapperClass?: string;
	};

	let { wrapperClass }: Props = $props();
	const data = [
		{
			id: 'WhyUsItem1',
			title: '​Empresa mejor valorada del sector en Trustpilot',
			description: 'Nuestra media de satisfacción es de 4,7 sobre 5, con más 47,000 opiniones.'
		},
		{
			id: 'WhyUsItem2',
			icon: 'Heart',
			title: '​Empresa mejor valorada del sector en Trustpilot',
			description: 'Nuestra media de satisfacción es de 4,7 sobre 5, con más 47,000 opiniones.'
		},
		{
			id: 'WhyUsItem3',
			icon: 'BuendiaCommentHollow',
			title: '​Empresa mejor valorada del sector en Trustpilot',
			description: 'Nuestra media de satisfacción es de 4,7 sobre 5, con más 47,000 opiniones.'
		},
		{
			id: 'WhyUsItem4',
			icon: 'SmileCircle',
			title: '​Empresa mejor valorada del sector en Trustpilot',
			description: 'Nuestra media de satisfacción es de 4,7 sobre 5, con más 47,000 opiniones.'
		}
	];
</script>

<div class={wrapperClass}>
	<h2 class="h2-editorial mb-5">Qué nos diferencia</h2>
	<div class="grid grid-cols-1 gap-4 xl:grid-cols-[1.001fr_1fr_1fr_1fr]">
		{#each data as item (item.id)}
			<WhyUsItem {item} />
		{/each}
	</div>
</div>
