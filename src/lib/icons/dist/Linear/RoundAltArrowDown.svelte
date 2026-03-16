<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="Linear.RoundAltArrowDown" {...props}>
	<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="var(--icon-stroke-width)" />
	<path
		d="M15 10.5L12 13.5L9 10.5"
		stroke="currentColor"
		stroke-width="var(--icon-stroke-width)"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</Icon>
