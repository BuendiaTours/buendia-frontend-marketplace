<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon {...props}>
	<circle cx="15" cy="9" r="7" stroke="currentColor" stroke-width="1.5" />
	<circle cx="15" cy="9" r="2" stroke="currentColor" stroke-width="1.5" />
	<path d="M3.5 20.5L9.5 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
	<path
		d="M6 21L4.5 19.5M6.5 17.5L8 19"
		stroke="currentColor"
		stroke-width="1.5"
		stroke-linecap="round"
	/>
</Icon>
