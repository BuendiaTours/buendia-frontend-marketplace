<script lang="ts">
	// CSS específico del backoffice (DaisyUI + themes + custom)
	import '../layout-backoffice.css';

	let { children } = $props();

	// Añadir clases al <html> cuando estamos en auth
	$effect(() => {
		document.documentElement.classList.add('route-auth', 'bnd-backoffice');
		return () => {
			document.documentElement.classList.remove('route-auth', 'bnd-backoffice');
		};
	});
</script>

<div class="min-h-screen">
	<main class="backoffice-container px-4">
		{@render children()}
	</main>
</div>
