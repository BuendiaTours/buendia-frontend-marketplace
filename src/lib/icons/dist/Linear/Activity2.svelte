<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="Linear.Activity2" {...props}>
	<path
		d="M12,17L12,11"
		style="fill:none;fill-rule:nonzero;stroke:rgb(46,49,56);stroke-width:2px;"
	/>
	<path d="M8,17L8,14" style="fill:none;fill-rule:nonzero;stroke:rgb(46,49,56);stroke-width:2px;" />
	<path
		d="M2,10.89C2,6.7 2,4.6 3.17,3.3C4.34,2 6.23,2 10,2L14,2C17.77,2 19.66,2 20.83,3.3C22,4.6 22,6.7 22,10.89L22,13.11C22,17.3 22,19.4 20.83,20.7C19.66,22 17.77,22 14,22L10,22C6.23,22 4.34,22 3.17,20.7C2,19.4 2,17.3 2,13.11L2,10.89Z"
		style="fill:none;fill-rule:nonzero;stroke:rgb(46,49,56);stroke-width:2px;stroke-linecap:butt;"
	/>
</Icon>
