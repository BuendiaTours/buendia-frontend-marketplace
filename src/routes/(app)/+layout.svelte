<script lang="ts">
	// Components
	import Header from '$lib/layout/Header.svelte';
	import Footer from '$lib/layout/Footer.svelte';
	import AlertDialog from '$lib/components/AlertDialog.svelte';

	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col">
	<Header title="Activities App" />

	<main class="container mx-auto flex-1 p-4">
		{@render children()}
	</main>

	<Footer />
</div>

<AlertDialog />
