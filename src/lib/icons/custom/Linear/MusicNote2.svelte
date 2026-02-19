<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon {...props}>
	<path d="M13 18V10V2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
	<circle cx="9" cy="18" r="4" stroke="currentColor" stroke-width="1.5" />
	<path
		d="M19 8C15.6863 8 13 5.31371 13 2"
		stroke="currentColor"
		stroke-width="1.5"
		stroke-linecap="round"
	/>
</Icon>
