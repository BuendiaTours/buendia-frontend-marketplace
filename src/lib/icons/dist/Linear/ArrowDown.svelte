<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="Linear.ArrowDown" {...props}>
	<path d="M12 4L12 20M12 20L18 14M12 20L6 14" stroke="currentColor" stroke-width="var(--icon-stroke-width)" stroke-linecap="round" stroke-linejoin="round"/>
</Icon>
