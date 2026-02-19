<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon {...props}>
	<circle cx="5" cy="12" r="2" stroke="currentColor" stroke-width="1.5" />
	<circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="1.5" />
	<circle cx="19" cy="12" r="2" stroke="currentColor" stroke-width="1.5" />
</Icon>
