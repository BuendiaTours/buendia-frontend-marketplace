<script lang="ts">
	import { API_ENDPOINTS } from '$lib/api/endpoints-metadata';
	import { apiConfig } from '$lib/api/config';
	import { copyToClipboard } from '$lib/utils/misc';
	import { InfoEmpty, Copy, CheckCircle } from 'svelte-iconoir';

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

<div class="container mx-auto flex flex-col gap-y-4">
	<h1 class="text-lg">API Endpoints Catalog</h1>
	<p class="mt-4 text-neutral-content">
		Catálogo dinámico de endpoints - Se actualiza automáticamente al añadir nuevos endpoints
	</p>
	<div class="flex items-center gap-2 rounded-lg bg-base-200 p-4">
		<div>
			<label class="label w-full text-sm">Base URL</label>
			<code class="text-sm text-primary">{apiConfig.baseURL}</code>
		</div>
	</div>
	<div class="alert alert-soft alert-info">
		<InfoEmpty class="size-4" />
		<span class="text-sm"
			>Esta página se genera automáticamente desde <code>src/lib/api/endpoints-metadata.ts</code
			></span
		>
	</div>

	{#each endpointGroups as group}
		<div class="card p-4">
			<div class="mb-4 flex items-center justify-between">
				<div>
					<h2 class="text-md card-title">{group.name}</h2>
					<p class="text-sm text-neutral-content">{group.description}</p>
				</div>
				<div class="badge rounded-md badge-neutral">{group.endpoints.length} endpoints</div>
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
							<tr class="text-xs">
								<td>
									<span
										class="badge w-16 rounded-sm {getMethodColor(
											endpoint.method
										)} font-mono badge-sm"
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
	{/each}

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="card p-4">
			<h3 class="card-title text-lg">Configuración de API</h3>
			<ul class="space-y-2 text-sm">
				<li class="flex justify-between">
					<span class="text-neutral-content">Timeout:</span>
					<code>{apiConfig.timeout}ms</code>
				</li>
				<li class="flex justify-between">
					<span class="text-neutral-content">Reintentos:</span>
					<code>{apiConfig.retry.attempts} intentos</code>
				</li>
				<li class="flex justify-between">
					<span class="text-neutral-content">Delay entre reintentos:</span>
					<code>{apiConfig.retry.delay}ms</code>
				</li>
				<li class="flex justify-between">
					<span class="text-neutral-content">Backoff:</span>
					<code>{apiConfig.retry.backoff}x</code>
				</li>
			</ul>
		</div>

		<div class="card p-4">
			<h3 class="text-md card-title">Notas</h3>
			<ul class="list-inside list-disc space-y-2 text-sm text-neutral-content">
				<li>Los parámetros con <code>:</code> son parámetros de ruta</li>
				<li>Los endpoints con paginación aceptan <code>page</code> y <code>limit</code></li>
				<li>Los endpoints protegidos requieren header <code>Authorization</code></li>
				<li>Códigos de reintento: {apiConfig.retry.retryOn.join(', ')}</li>
			</ul>
		</div>
	</div>

	<div class="card border-success/20 bg-success/10 p-4">
		<h3 class="text-md card-title text-success">✨ Actualización Automática</h3>
		<p class="text-sm text-neutral-content">
			Para añadir un nuevo endpoint, simplemente agrégalo a
			<code>src/lib/api/endpoints-metadata.ts</code> siguiendo la estructura existente. Esta página se
			actualizará automáticamente sin necesidad de modificar ningún otro archivo.
		</p>
		<div class="mt-4 rounded rounded-md bg-base-200 p-4 text-xs">
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
