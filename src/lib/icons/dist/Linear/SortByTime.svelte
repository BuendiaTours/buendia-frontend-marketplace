<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="SortByTime" {...props}>
	<path d="M10 7L2 7" stroke="currentColor" stroke-width="var(--icon-stroke-width)" stroke-linecap="round"/>
<path d="M8 12H2" stroke="currentColor" stroke-width="var(--icon-stroke-width)" stroke-linecap="round"/>
<path d="M10 17H2" stroke="currentColor" stroke-width="var(--icon-stroke-width)" stroke-linecap="round"/>
<circle cx="17" cy="12" r="5" stroke="currentColor" stroke-width="var(--icon-stroke-width)"/>
<path d="M17 10V11.8462L18 13" stroke="currentColor" stroke-width="var(--icon-stroke-width)" stroke-linecap="round" stroke-linejoin="round"/>
</Icon>
