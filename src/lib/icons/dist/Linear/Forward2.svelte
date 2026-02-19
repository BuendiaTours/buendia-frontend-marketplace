<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon {...props}>
	<path
		d="M19.5 12L14.5 17M19.5 12L14.5 7M19.5 12L9.5 12C7.83333 12 4.5 11 4.5 7"
		stroke="currentColor"
		stroke-width="var(--icon-stroke-width)"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</Icon>
