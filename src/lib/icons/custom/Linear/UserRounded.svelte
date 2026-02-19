<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon {...props}>
	<circle cx="12" cy="6" r="4" stroke="currentColor" stroke-width="1.5" />
	<ellipse cx="12" cy="17" rx="7" ry="4" stroke="currentColor" stroke-width="1.5" />
</Icon>
