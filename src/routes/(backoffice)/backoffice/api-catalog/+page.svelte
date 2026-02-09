<script lang="ts">
	import type { PageData } from './$types';
	import { API_ENDPOINTS } from '$lib/api/endpoints.config';
	import { apiConfig } from '$lib/api/config';
	import { copyToClipboard } from '$lib/utils/misc';
	import { InfoEmpty, Copy, CheckCircle } from 'svelte-iconoir';

	let { data }: { data: PageData } = $props();

	let copiedEndpoint = $state<string | null>(null);

	// Función para obtener el path con placeholders
	function getPathWithPlaceholders(pathFn: Function): string {
		const fnString = pathFn.toString();
		const paramMatch = fnString.match(/\(([^)]*)\)/);

		if (paramMatch && paramMatch[1]) {
			const params = paramMatch[1].split(',').map((p) => p.trim().split(':')[0].trim());
			return pathFn(...params.map((p) => `:${p}`));
		}

		return pathFn();
	}

	function getMethodColor(method: string) {
		const colors: Record<string, string> = {
			GET: 'badge-info',
			POST: 'badge-success',
			PUT: 'badge-warning',
			PATCH: 'badge-warning',
			DELETE: 'badge-error'
		};
		return colors[method] || 'badge-ghost';
	}

	async function handleCopy(text: string) {
		const success = await copyToClipboard(text);
		if (success) {
			copiedEndpoint = text;
			setTimeout(() => {
				copiedEndpoint = null;
			}, 2000);
		}
	}

	const fullUrl = (path: string) => `${apiConfig.baseURL}${path}`;

	// Transformar metadata en estructura para la vista
	const endpointGroups = Object.entries(API_ENDPOINTS).map(([key, group]) => {
		// Extraer groupName y groupDescription, el resto son endpoints
		const { groupName, groupDescription, ...endpoints } = group;

		return {
			key,
			name: groupName,
			description: groupDescription,
			endpoints: Object.entries(endpoints).map(([endpointKey, endpoint]: [string, any]) => ({
				key: endpointKey,
				name: endpointKey.charAt(0).toUpperCase() + endpointKey.slice(1),
				method: endpoint.method,
				path: getPathWithPlaceholders(endpoint.path),
				params: endpoint.params?.join(', ') || '-',
				description: endpoint.description
			}))
		};
	});
</script>

<div class="backoffice-container flex flex-col gap-y-4">
	<h1 class="text-lg">API Endpoints Catalog</h1>
	<p class="mt-4">
		Catálogo dinámico de endpoints - Se actualiza automáticamente al añadir nuevos endpoints
	</p>
	<div class="bg-base-200 flex items-center gap-2 rounded-lg p-4">
		<div>
			<label class="label w-full text-sm">Base URL</label>
			<code class="text-md">{apiConfig.baseURL}</code>
		</div>
	</div>

	<!-- Remote Functions Info -->
	<div class="alert alert-success alert-soft">
		<InfoEmpty class="size-4" />
		<div class="flex flex-col gap-1">
			<span class="text-sm font-semibold">Remote Functions Habilitadas</span>
			<span class="text-sm">
				Los antiguos endpoints proxy (<code>/api/*</code>) han sido reemplazados por
				<strong>Remote Functions</strong> de SvelteKit. Estas permiten llamadas type-safe desde componentes
				al servidor sin necesidad de crear endpoints HTTP manualmente.
			</span>
			<span class="text-base-content/70 mt-1 text-xs">
				📁 Ver: <code>src/lib/api/common.remote.ts</code>
			</span>
		</div>
	</div>

	<div class="alert alert-soft">
		<InfoEmpty class="size-4" />
		<span class="text-sm"
			>Los endpoints a continuación se generan automáticamente desde <code
				>src/lib/api/endpoints.config.ts</code
			></span
		>
	</div>

	<!-- API Externa Endpoints -->
	{#each endpointGroups as group}
		<div class="card p-4">
			<div
				class="bnd-main-actions bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 pb-4"
			>
				<div>
					<h2 class="text-md card-title">{group.name}</h2>
					<p class="text-sm">{group.description}</p>
				</div>
				<div class="badge badge-neutral rounded-md">{group.endpoints.length} endpoints</div>
			</div>

			<div class="overflow-x-auto">
				<table class="table-zebra table">
					<thead>
						<tr>
							<th class="w-24">Método</th>
							<th>Endpoint</th>
							<th class="w-48">Parámetros</th>
							<th>Descripción</th>
							<th class="w-16"></th>
						</tr>
					</thead>
					<tbody>
						{#each group.endpoints as endpoint}
							<tr class="text-sm">
								<td>
									<span
										class="badge w-16 rounded-sm {getMethodColor(
											endpoint.method
										)} badge-sm font-mono"
									>
										{endpoint.method}
									</span>
								</td>
								<td>
									<span class="font-mono">
										{endpoint.path}
									</span>
								</td>
								<td>
									<span class="text-base-content/60">{endpoint.params}</span>
								</td>
								<td>{endpoint.description}</td>
								<td>
									<button
										class="btn btn-square btn-ghost btn-xs"
										onclick={() => handleCopy(fullUrl(endpoint.path))}
										title="Copiar URL completa"
									>
										{#if copiedEndpoint === fullUrl(endpoint.path)}
											<CheckCircle class="text-success size-4" />
										{:else}
											<Copy class="size-4" />
										{/if}
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/each}

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="card p-4">
			<h3 class="card-title text-lg">Configuración de API</h3>
			<ul class="space-y-2 text-sm">
				<li class="flex justify-between">
					<span>Timeout:</span>
					<code>{apiConfig.timeout}ms</code>
				</li>
				<li class="flex justify-between">
					<span>Reintentos:</span>
					<code>{apiConfig.retry.attempts} intentos</code>
				</li>
				<li class="flex justify-between">
					<span>Delay entre reintentos:</span>
					<code>{apiConfig.retry.delay}ms</code>
				</li>
				<li class="flex justify-between">
					<span>Backoff:</span>
					<code>{apiConfig.retry.backoff}x</code>
				</li>
			</ul>
		</div>

		<div class="card p-4">
			<h3 class="text-md card-title">Notas</h3>
			<ul class="list-inside list-disc space-y-2 text-sm">
				<li>Los parámetros con <code>:</code> son parámetros de ruta</li>
				<li>Los endpoints con paginación aceptan <code>page</code> y <code>limit</code></li>
				<li>Los endpoints protegidos requieren header <code>Authorization</code></li>
				<li>Códigos de reintento: {apiConfig.retry.retryOn.join(', ')}</li>
			</ul>
		</div>
	</div>

	<div class="card border-success/20 bg-success/10 p-4">
		<h3 class="text-md card-title text-success">✨ Actualización Automática</h3>
		<p class="text-sm">
			Para añadir un nuevo endpoint, simplemente agrégalo a
			<code>src/lib/api/endpoints.config.ts</code> siguiendo la estructura existente. Esta página se actualizará
			automáticamente sin necesidad de modificar ningún otro archivo.
		</p>
		<div class="bg-base-200 mt-4 rounded rounded-md p-4 text-xs">
			<pre><code
					>// Ejemplo de cómo añadir un nuevo endpoint
newEndpoint: &#123;
	path: (id: string) => `/new-resource/$&#123;id&#125;`,
	method: 'GET',
	description: 'Descripción del endpoint',
	params: ['id', 'optional-param']
&#125;</code
				></pre>
		</div>
	</div>
</div>
