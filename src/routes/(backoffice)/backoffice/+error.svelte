<script lang="ts">
	import { page } from '$app/state';
	import { WarningTriangle } from 'svelte-iconoir';
	import ErrorDisplay from '$lib/components/ErrorDisplay.svelte';
	import { ROUTES } from '$lib/config/routes';

	const isApiError = $derived(page.status === 500 || page.status === 502 || page.status === 503);

	const errorTitle = $derived(isApiError ? 'Servicio no disponible' : `Error ${page.status}`);

	const errorMessage = $derived(
		isApiError
			? 'No se puede conectar con el servidor. Por favor, verifica que la API esté funcionando e intenta de nuevo.'
			: page.error?.message || 'Ha ocurrido un error inesperado'
	);

	const technicalDetails = $derived({
		status: page.status,
		message: page.error?.message,
		url: page.url.pathname
	});
</script>

<ErrorDisplay title={errorTitle} message={errorMessage} {technicalDetails}>
	{#snippet actions()}
		<a href={ROUTES.backoffice.home} class="btn btn-primary">Volver al inicio</a>
		<button class="btn btn-outline" onclick={() => window.location.reload()}> Reintentar </button>
	{/snippet}
</ErrorDisplay>
