<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="Linear.RecordAudioCircle" {...props}>
	<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="var(--icon-stroke-width)" />
	<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="var(--icon-stroke-width)" />
</Icon>
