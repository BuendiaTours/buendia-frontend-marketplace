<script lang="ts">
	// CSS específico del marketplace (solo Tailwind, sin DaisyUI)
	import './layout-marketplace.css';

	// CSS de PhotoSwipe (librería externa)
	import 'photoswipe/style.css';

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

<div class="min-h-screen">
	<main>
		{@render children()}
	</main>
</div>
