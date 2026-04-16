<script lang="ts">
	import '../(marketplace)/layout-marketplace.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<main class="layout-content-area flex-1">
		{@render children()}
	</main>
</div>
