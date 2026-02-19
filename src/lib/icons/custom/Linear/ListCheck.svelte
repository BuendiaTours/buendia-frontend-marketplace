<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon {...props}>
	<path
		d="M14 16L16.1 18.5L20 13.5"
		stroke="currentColor"
		stroke-width="1.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path d="M21 6L3 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
	<path d="M21 10L3 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
	<path d="M10 14H3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
	<path d="M10 18H3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
</Icon>
