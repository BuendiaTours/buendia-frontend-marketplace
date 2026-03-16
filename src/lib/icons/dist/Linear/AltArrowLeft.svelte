<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="Linear.AltArrowLeft" {...props}>
	<path
		d="M15 5L9 12L15 19"
		stroke="currentColor"
		stroke-width="var(--icon-stroke-width)"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</Icon>
