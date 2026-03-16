<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="Linear.RoundArrowRight" {...props}>
	<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="var(--icon-stroke-width)" />
	<path
		d="M8 12C12.6863 12 11.3137 12 16 12M16 12L13 9M16 12L13 15"
		stroke="currentColor"
		stroke-width="var(--icon-stroke-width)"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</Icon>
