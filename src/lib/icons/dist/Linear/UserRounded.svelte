<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="Linear.UserRounded" {...props}>
	<circle cx="12" cy="6" r="4" stroke="currentColor" stroke-width="var(--icon-stroke-width)"/>
<ellipse cx="12" cy="17" rx="7" ry="4" stroke="currentColor" stroke-width="var(--icon-stroke-width)"/>
</Icon>
