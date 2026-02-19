<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon {...props}>
	<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
	<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5" />
</Icon>
