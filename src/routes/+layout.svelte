<script lang="ts">
	import './layout.css';
	import '$lib/styles/variables.css';
	import '$lib/styles/custom.css';

	let { children } = $props();
</script>

{@render children()}
