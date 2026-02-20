<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="Linear.SortFromTopToBottom" {...props}>
	<path d="M4 16L13 16" stroke="currentColor" stroke-width="var(--icon-stroke-width)" stroke-linecap="round"/>
<path d="M6 11H13" stroke="currentColor" stroke-width="var(--icon-stroke-width)" stroke-linecap="round"/>
<path d="M8 6L13 6" stroke="currentColor" stroke-width="var(--icon-stroke-width)" stroke-linecap="round"/>
<path d="M17 4L17 20L20 16" stroke="currentColor" stroke-width="var(--icon-stroke-width)" stroke-linecap="round" stroke-linejoin="round"/>
</Icon>
