<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon {...props}>
	<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
	<path d="M12 7V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
	<circle cx="12" cy="16" r="1" fill="currentColor" />
</Icon>
