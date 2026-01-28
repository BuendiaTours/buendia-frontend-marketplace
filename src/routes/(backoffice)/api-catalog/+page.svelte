<script lang="ts">
	import { ENDPOINTS_METADATA } from '$lib/api/endpoints-metadata';
	import { apiConfig } from '$lib/api/config';
	import { Code, Copy, CheckCircle } from 'svelte-iconoir';

	let copiedEndpoint = $state<string | null>(null);

	// Función para obtener el path con placeholders
	function getPathWithPlaceholders(pathFn: Function): string {
		const fnString = pathFn.toString();
		const paramMatch = fnString.match(/\(([^)]*)\)/);
		
		if (paramMatch && paramMatch[1]) {
			const params = paramMatch[1].split(',').map(p => p.trim().split(':')[0].trim());
			return pathFn(...params.map(p => `:${p}`));
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

	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			copiedEndpoint = text;
			setTimeout(() => {
				copiedEndpoint = null;
			}, 2000);
		} catch (err) {
			console.error('Error copying to clipboard:', err);
		}
	}

	const fullUrl = (path: string) => `${apiConfig.baseURL}${path}`;

	// Transformar metadata en estructura para la vista
	const endpointGroups = Object.entries(ENDPOINTS_METADATA).map(([key, group]) => ({
		key,
		name: group.groupName,
		description: group.groupDescription,
		endpoints: Object.entries(group.endpoints).map(([endpointKey, endpoint]) => ({
			key: endpointKey,
			name: endpointKey.charAt(0).toUpperCase() + endpointKey.slice(1),
			method: endpoint.method,
			path: getPathWithPlaceholders(endpoint.path),
			params: endpoint.params?.join(', ') || '-',
			description: endpoint.description
		}))
	}));
</script>

<div class="container mx-auto p-6">
	<div class="mb-8">
		<h1 class="text-3xl font-bold mb-2">API Endpoints Catalog</h1>
		<p class="text-base-content/70 mb-4">
			Catálogo dinámico de endpoints - Se actualiza automáticamente al añadir nuevos endpoints
		</p>
		<div class="flex items-center gap-2 rounded-lg bg-base-200 p-4">
			<Code class="size-5" />
			<div>
				<p class="text-sm font-semibold">Base URL</p>
				<code class="text-sm text-primary">{apiConfig.baseURL}</code>
			</div>
		</div>
		<div class="mt-4 alert alert-info">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="stroke-current shrink-0 w-6 h-6"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				></path>
			</svg>
			<span class="text-sm"
				>Esta página se genera automáticamente desde <code
					>src/lib/api/endpoints-metadata.ts</code
				></span
			>
		</div>
	</div>

	<div class="space-y-8">
		{#each endpointGroups as group}
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<div class="flex items-center justify-between mb-4">
						<div>
							<h2 class="card-title text-2xl">{group.name}</h2>
							<p class="text-base-content/70">{group.description}</p>
						</div>
						<div class="badge badge-outline">{group.endpoints.length} endpoints</div>
					</div>

					<div class="overflow-x-auto">
						<table class="table table-zebra">
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
									<tr>
										<td>
											<span class="badge {getMethodColor(endpoint.method)} badge-sm font-mono">
												{endpoint.method}
											</span>
										</td>
										<td>
											<code class="text-xs bg-base-200 px-2 py-1 rounded">
												{endpoint.path}
											</code>
										</td>
										<td>
											<span class="text-xs text-base-content/60">{endpoint.params}</span>
										</td>
										<td class="text-sm">{endpoint.description}</td>
										<td>
											<button
												class="btn btn-ghost btn-xs"
												onclick={() => copyToClipboard(fullUrl(endpoint.path))}
												title="Copiar URL completa"
											>
												{#if copiedEndpoint === fullUrl(endpoint.path)}
													<CheckCircle class="size-4 text-success" />
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
			</div>
		{/each}
	</div>

	<div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
		<div class="card bg-base-200">
			<div class="card-body">
				<h3 class="card-title text-lg">Configuración de API</h3>
				<ul class="space-y-2 text-sm">
					<li class="flex justify-between">
						<span class="text-base-content/70">Timeout:</span>
						<code>{apiConfig.timeout}ms</code>
					</li>
					<li class="flex justify-between">
						<span class="text-base-content/70">Reintentos:</span>
						<code>{apiConfig.retry.attempts} intentos</code>
					</li>
					<li class="flex justify-between">
						<span class="text-base-content/70">Delay entre reintentos:</span>
						<code>{apiConfig.retry.delay}ms</code>
					</li>
					<li class="flex justify-between">
						<span class="text-base-content/70">Backoff:</span>
						<code>{apiConfig.retry.backoff}x</code>
					</li>
				</ul>
			</div>
		</div>

		<div class="card bg-base-200">
			<div class="card-body">
				<h3 class="card-title text-lg">Notas</h3>
				<ul class="list-disc list-inside space-y-2 text-sm text-base-content/70">
					<li>Los parámetros con <code>:</code> son parámetros de ruta</li>
					<li>Los endpoints con paginación aceptan <code>page</code> y <code>limit</code></li>
					<li>Los endpoints protegidos requieren header <code>Authorization</code></li>
					<li>Códigos de reintento: {apiConfig.retry.retryOn.join(', ')}</li>
				</ul>
			</div>
		</div>
	</div>

	<div class="mt-8 card bg-success/10 border border-success/20">
		<div class="card-body">
			<h3 class="card-title text-lg text-success">✨ Actualización Automática</h3>
			<p class="text-sm text-base-content/70">
				Para añadir un nuevo endpoint, simplemente agrégalo a
				<code>src/lib/api/endpoints-metadata.ts</code> siguiendo la estructura existente. Esta
				página se actualizará automáticamente sin necesidad de modificar ningún otro archivo.
			</p>
			<div class="mt-4 mockup-code text-xs">
				<pre><code>// Ejemplo de cómo añadir un nuevo endpoint
newEndpoint: &#123;
  path: (id: string) => `/new-resource/$&#123;id&#125;`,
  method: 'GET',
  description: 'Descripción del endpoint',
  params: ['id', 'optional-param']
&#125;</code></pre>
			</div>
		</div>
	</div>
</div>
