<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="Linear.ArrowRight" {...props}>
	<path
		d="M4 12H20M20 12L14 6M20 12L14 18"
		stroke="currentColor"
		stroke-width="var(--icon-stroke-width)"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</Icon>
