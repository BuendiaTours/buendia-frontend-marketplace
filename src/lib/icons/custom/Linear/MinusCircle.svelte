<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon {...props}>
	<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
	<path d="M15 12H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
</Icon>
