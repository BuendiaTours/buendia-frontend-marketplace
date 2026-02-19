<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon {...props}>
	<path d="M20 6L3 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
	<path d="M20 11L3 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
	<path d="M11 16H3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
	<path
		d="M14 18L17.5 15L21 18"
		stroke="currentColor"
		stroke-width="1.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</Icon>
