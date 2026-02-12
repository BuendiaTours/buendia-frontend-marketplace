<script lang="ts">
	// CSS específico del marketplace (solo Tailwind, sin DaisyUI)
	import './layout-marketplace.css';

	// CSS de PhotoSwipe (librería externa)
	import 'photoswipe/style.css';

	// Layout marketplace
	import Header from '$lib/layout/marketplace/Header.svelte';
	import Footer from '$lib/layout/marketplace/Footer.svelte';

	let { children } = $props();

	// Añadir clase al <html> cuando estamos en marketplace
	// $effect(() => {
	// 	document.documentElement.classList.add('bnd-marketplace');
	// 	return () => {
	// 		document.documentElement.classList.remove('bnd-marketplace');
	// 	};
	// });
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<Header title="Backoffice App" />

	<main class="b-layout-content-area flex-1">
		<!-- MsgAlertBox /-->
		{@render children()}
	</main>

	<Footer />
</div>
