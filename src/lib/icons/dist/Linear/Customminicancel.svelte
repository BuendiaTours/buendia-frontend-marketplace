<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="Linear.CustomMiniCancel" {...props}>
	<path d="M7,7L17,17" fill="none" stroke="currentColor" stroke-width="var(--icon-stroke-width)" stroke-linecap="round" />
    <path d="M7,17L17,7" fill="none" stroke="currentColor" stroke-width="var(--icon-stroke-width)" stroke-linecap="round" />
</Icon>
