<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon {...props}>
	<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="var(--icon-stroke-width)" />
	<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="var(--icon-stroke-width)" />
	<path d="M15 9L19 5" stroke="currentColor" stroke-width="var(--icon-stroke-width)" />
	<path d="M5 19L9 15" stroke="currentColor" stroke-width="var(--icon-stroke-width)" />
	<path d="M9 9L5 5" stroke="currentColor" stroke-width="var(--icon-stroke-width)" />
	<path d="M19 19L15 15" stroke="currentColor" stroke-width="var(--icon-stroke-width)" />
</Icon>
