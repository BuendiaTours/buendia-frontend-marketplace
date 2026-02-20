<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="Linear.MagnifierZoomIn" {...props}>
	<circle cx="11.5" cy="11.5" r="9.5" stroke="currentColor" stroke-width="var(--icon-stroke-width)"/>
<path d="M18.5 18.5L22 22" stroke="currentColor" stroke-width="var(--icon-stroke-width)" stroke-linecap="round"/>
<path d="M9 11.5H11.5M11.5 11.5H14M11.5 11.5V14M11.5 11.5V9" stroke="currentColor" stroke-width="var(--icon-stroke-width)" stroke-linecap="round"/>
</Icon>
