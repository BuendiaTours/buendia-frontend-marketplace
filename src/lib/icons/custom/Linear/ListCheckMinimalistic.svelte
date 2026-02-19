<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon {...props}>
	<path d="M20 6L3 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
	<path d="M10 11L3 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
	<path d="M10 16H3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
	<path
		d="M14 13.5L16.1 16L20 11"
		stroke="currentColor"
		stroke-width="1.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</Icon>
