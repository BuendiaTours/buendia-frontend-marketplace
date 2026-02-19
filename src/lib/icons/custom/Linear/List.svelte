<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon {...props}>
	<path d="M20 7L4 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
	<path d="M15 12L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
	<path d="M9 17H4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
</Icon>
