<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="Linear.MenuDotsCircle" {...props}>
	<path
		d="M8 12H8.00901M12.0045 12H12.0135M15.991 12H16"
		stroke="currentColor"
		stroke-width="var(--icon-stroke-width)"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="var(--icon-stroke-width)" />
</Icon>
