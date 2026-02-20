<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="Linear.Close" {...props}>
	<path d="M20.5,3.5L3.5,20.5M3.5,3.5L20.5,20.5" fill="currentColor" stroke="currentColor" stroke-width="var(--icon-stroke-width)"/>
</Icon>
