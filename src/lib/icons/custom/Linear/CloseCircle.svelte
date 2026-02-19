<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon {...props}>
	<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
	<path
		d="M14.5 9.50002L9.5 14.5M9.49998 9.5L14.5 14.5"
		stroke="currentColor"
		stroke-width="1.5"
		stroke-linecap="round"
	/>
</Icon>
