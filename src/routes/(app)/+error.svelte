<script lang="ts">
	import { page } from '$app/stores';
	import { WarningTriangle } from 'svelte-iconoir';

	const isApiError = $derived($page.status === 500 || $page.status === 502 || $page.status === 503);
</script>

<div class="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
	<div class="text-error">
		<WarningTriangle width={64} height={64} />
	</div>

	<div class="max-w-md space-y-2">
		<h1 class="text-3xl font-bold">
			{#if isApiError}
				Servicio no disponible
			{:else}
				Error {$page.status}
			{/if}
		</h1>

		<p class="text-base-content/70">
			{#if isApiError}
				No se puede conectar con el servidor. Por favor, verifica que la API esté funcionando e
				intenta de nuevo.
			{:else}
				{$page.error?.message || 'Ha ocurrido un error inesperado'}
			{/if}
		</p>
	</div>

	<div class="flex gap-3">
		<a href="/" class="btn btn-primary">Volver al inicio</a>
		<button class="btn btn-outline" onclick={() => window.location.reload()}> Reintentar </button>
	</div>

	{#if import.meta.env.DEV}
		<details class="mt-8 max-w-2xl text-left">
			<summary class="cursor-pointer text-sm text-base-content/50">Detalles técnicos (dev)</summary>
			<pre class="mt-2 rounded bg-base-200 p-4 text-xs">{JSON.stringify(
					{
						status: $page.status,
						message: $page.error?.message,
						url: $page.url.pathname
					},
					null,
					2
				)}</pre>
		</details>
	{/if}
</div>
