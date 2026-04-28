<script lang="ts">
	type Props = {
		wrapperClass?: string;
		ref?: HTMLDivElement;
	};

	let { wrapperClass, ref = $bindable() }: Props = $props();
</script>

<div
	bind:this={ref}
	class="flex items-center gap-4 rounded-xl border border-solid border-neutral-300 bg-white p-2 {wrapperClass ??
		''}"
>
	<input
		type="text"
		class="p-lg flex-[0_1_100%] border-0 placeholder:text-neutral-600"
		placeholder="Busca destino"
	/>
	<button type="button" class="e-button">Buscar</button>
</div>
