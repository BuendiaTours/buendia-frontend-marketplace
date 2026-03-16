<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="Linear.ArrowUp" {...props}>
	<path
		d="M12 20L12 4M12 4L18 10M12 4L6 10"
		stroke="currentColor"
		stroke-width="var(--icon-stroke-width)"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</Icon>
