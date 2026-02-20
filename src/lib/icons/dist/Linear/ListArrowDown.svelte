<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="Linear.ListArrowDown" {...props}>
	<path d="M15 17.5L17.5 20M17.5 20L20 17.5M17.5 20V14" stroke="currentColor" stroke-width="var(--icon-stroke-width)" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M21 6L3 6" stroke="currentColor" stroke-width="var(--icon-stroke-width)" stroke-linecap="round"/>
<path d="M21 10L3 10" stroke="currentColor" stroke-width="var(--icon-stroke-width)" stroke-linecap="round"/>
<path d="M11 14L3 14" stroke="currentColor" stroke-width="var(--icon-stroke-width)" stroke-linecap="round"/>
<path d="M11 18H3" stroke="currentColor" stroke-width="var(--icon-stroke-width)" stroke-linecap="round"/>
</Icon>
