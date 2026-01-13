<script lang="ts">
	// CSS
	import './layout.css';
	// Assets
	import favicon from '$lib/assets/favicon.svg';
	// Components
	import Header from '$lib/layout/Header.svelte';
	import Footer from '$lib/layout/Footer.svelte';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<Header title="Activities App" />

	<main class="container mx-auto flex-1 p-4">
		{@render children()}
	</main>

	<Footer />
</div>

<ConfirmDialog />
