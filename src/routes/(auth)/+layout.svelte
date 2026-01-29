<script lang="ts">
	let { children } = $props();
</script>

<div class="min-h-screen">
	<main class="backoffice-container px-4">
		{@render children()}
	</main>
</div>
