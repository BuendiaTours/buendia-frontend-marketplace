<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="Linear.RoundDoubleAltArrowUp" {...props}>
	<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="var(--icon-stroke-width)" />
	<path
		d="M9 15.5L12 12.5L15 15.5"
		stroke="currentColor"
		stroke-width="var(--icon-stroke-width)"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path
		d="M9 11.5L12 8.5L15 11.5"
		stroke="currentColor"
		stroke-width="var(--icon-stroke-width)"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</Icon>
