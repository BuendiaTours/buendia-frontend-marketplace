<!--
ErrorDisplay - Componente reutilizable para mostrar errores

PROPÓSITO:
Componente genérico para mostrar mensajes de error con un diseño consistente
en toda la aplicación.

CARACTERÍSTICAS:
- Icono por defecto (WarningTriangle 64x64) - personalizable mediante snippet
- Título y mensaje configurables
- Snippet opcional para acciones (botones)
- Detalles técnicos opcionales en JSON
- Diseño centrado y responsive

USO BÁSICO (sin icono personalizado):
```svelte
<ErrorDisplay
  title="Error al cargar datos"
  message="No se pudo conectar con el servidor"
/>
```

USO COMPLETO:
```svelte
<ErrorDisplay
  title="Error al cargar datos"
  message="No se pudo conectar con el servidor"
  technicalDetails={{ status: 500, url: '/api/data' }}
>
  {#snippet icon()}
    <CustomIcon width={48} height={48} />
  {/snippet}
  {#snippet actions()}
    <button class="btn btn-primary">Reintentar</button>
  {/snippet}
</ErrorDisplay>
```
-->

<script lang="ts">
	import { WarningTriangle } from 'svelte-iconoir';
	import type { Snippet } from 'svelte';

	interface Props {
		icon?: Snippet;
		title: string;
		message: string;
		technicalDetails?: Record<string, unknown>;
		showTechnicalDetails?: boolean;
		actions?: Snippet;
	}

	let {
		icon,
		title,
		message,
		technicalDetails,
		showTechnicalDetails = true,
		actions
	}: Props = $props();
</script>

<div class="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
	<!-- Icono de error -->
	<div class="text-error">
		{#if icon}
			{@render icon()}
		{:else}
			<!-- Icono por defecto -->
			<WarningTriangle width={64} height={64} />
		{/if}
	</div>

	<!-- Título y mensaje -->
	<div class="max-w-md space-y-2">
		<h1 class="text-3xl font-bold">
			{title}
		</h1>

		<p class="text-base">
			{message}
		</p>
	</div>

	<!-- Acciones (slot) -->
	{#if actions}
		<div class="flex gap-3">
			{@render actions()}
		</div>
	{/if}

	<!-- Detalles técnicos -->
	{#if showTechnicalDetails && technicalDetails}
		<details class="max-w-2xl text-left">
			<summary class="text-base-content/50 cursor-pointer text-sm">Detalles técnicos</summary>
			<pre class="bg-base-200 rounded p-4 text-xs">{JSON.stringify(technicalDetails, null, 2)}</pre>
		</details>
	{/if}
</div>
