<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="Linear.MenuDots" {...props}>
	<circle cx="5" cy="12" r="2" stroke="currentColor" stroke-width="var(--icon-stroke-width)" />
	<circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="var(--icon-stroke-width)" />
	<circle cx="19" cy="12" r="2" stroke="currentColor" stroke-width="var(--icon-stroke-width)" />
</Icon>
