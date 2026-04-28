<script lang="ts">
	import { page } from '$app/state';
	import MktErrorDisplay from '$lib/components/MktErrorDisplay.svelte';

	const isApiError = $derived(page.status === 500 || page.status === 502 || page.status === 503);
	const isNotFound = $derived(page.status === 404);

	const errorTitle = $derived(
		isNotFound
			? 'Página no encontrada'
			: isApiError
				? 'Servicio no disponible'
				: `Error ${page.status}`
	);

	const errorMessage = $derived(
		isNotFound
			? 'El contenido que buscas no existe o ha sido eliminado.'
			: isApiError
				? 'No se puede conectar con el servidor. Por favor, inténtalo más tarde.'
				: page.error?.message || 'Ha ocurrido un error inesperado.'
	);

	const technicalDetails = $derived({
		status: page.status,
		message: page.error?.message,
		url: page.url.pathname
	});
</script>

<MktErrorDisplay title={errorTitle} message={errorMessage} {technicalDetails}>
	{#snippet actions()}
		<a href="/" class="e-button e-button-secondary">Volver al inicio</a>
		<button class="e-button e-button-tertiary" onclick={() => window.location.reload()}>
			Reintentar
		</button>
	{/snippet}
</MktErrorDisplay>
