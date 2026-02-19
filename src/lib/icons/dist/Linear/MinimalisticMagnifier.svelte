<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon {...props}>
	<circle
		cx="11.5"
		cy="11.5"
		r="9.5"
		stroke="currentColor"
		stroke-width="var(--icon-stroke-width)"
	/>
	<path
		d="M20 20L22 22"
		stroke="currentColor"
		stroke-width="var(--icon-stroke-width)"
		stroke-linecap="round"
	/>
</Icon>
