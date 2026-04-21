<script lang="ts">
	import StepsItem from './StepsItem.svelte';

	type Props = {
		wrapperClass?: string;
	};

	let { wrapperClass }: Props = $props();
</script>

<div class="flex flex-wrap gap-4 {wrapperClass}">
	<StepsItem active={true} step={1} text="Datos personales" slug="/" />
	<StepsItem step={2} text="Datos de pago" />
</div>
