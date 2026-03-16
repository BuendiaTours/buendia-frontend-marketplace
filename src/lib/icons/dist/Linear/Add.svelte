<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="Linear.Add" {...props}>
	<path d="M22,12L2,12M12,2L12,22" stroke="currentColor" stroke-width="var(--icon-stroke-width)" />
</Icon>
