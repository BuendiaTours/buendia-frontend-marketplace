<script lang="ts">
	let { children } = $props();

	// Añadir clase al <html> cuando estamos en auth
	$effect(() => {
		document.documentElement.classList.add('route-auth');
		return () => {
			document.documentElement.classList.remove('route-auth');
		};
	});
</script>

<div class="min-h-screen">
	<main class="backoffice-container px-4">
		{@render children()}
	</main>
</div>
