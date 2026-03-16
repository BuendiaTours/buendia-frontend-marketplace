<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="Linear.ListArrowDownMinimalistic" {...props}>
	<path
		d="M20 6L3 6"
		stroke="currentColor"
		stroke-width="var(--icon-stroke-width)"
		stroke-linecap="round"
	/>
	<path
		d="M11 16L3 16"
		stroke="currentColor"
		stroke-width="var(--icon-stroke-width)"
		stroke-linecap="round"
	/>
	<path
		d="M12 11L3 11"
		stroke="currentColor"
		stroke-width="var(--icon-stroke-width)"
		stroke-linecap="round"
	/>
	<path
		d="M15 14.5L17.5 17M17.5 17L20 14.5M17.5 17V9"
		stroke="currentColor"
		stroke-width="var(--icon-stroke-width)"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</Icon>
