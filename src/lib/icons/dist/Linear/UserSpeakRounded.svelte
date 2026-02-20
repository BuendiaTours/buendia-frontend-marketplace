<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="Linear.UserSpeakRounded" {...props}>
	<circle cx="10" cy="6" r="4" stroke="currentColor" stroke-width="var(--icon-stroke-width)"/>
<ellipse cx="10" cy="17" rx="7" ry="4" stroke="currentColor" stroke-width="var(--icon-stroke-width)"/>
<path d="M19 2C19 2 21 3.2 21 6C21 8.8 19 10 19 10" stroke="currentColor" stroke-width="var(--icon-stroke-width)" stroke-linecap="round"/>
<path d="M17 4C17 4 18 4.6 18 6C18 7.4 17 8 17 8" stroke="currentColor" stroke-width="var(--icon-stroke-width)" stroke-linecap="round"/>
</Icon>
