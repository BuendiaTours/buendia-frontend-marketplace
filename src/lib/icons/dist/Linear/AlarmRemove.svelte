<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="Linear.AlarmRemove" {...props}>
	<circle cx="12" cy="13" r="9" stroke="currentColor" stroke-width="var(--icon-stroke-width)" />
	<path
		d="M15 13L12 13L9 13"
		stroke="currentColor"
		stroke-width="var(--icon-stroke-width)"
		stroke-linecap="round"
	/>
	<path
		d="M3.5 4.5L7.50002 2"
		stroke="currentColor"
		stroke-width="var(--icon-stroke-width)"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path
		d="M20.5 4.5L16.5 2"
		stroke="currentColor"
		stroke-width="var(--icon-stroke-width)"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</Icon>
