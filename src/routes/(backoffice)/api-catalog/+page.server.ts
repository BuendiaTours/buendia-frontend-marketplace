import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import type { PageServerLoad } from './$types';

interface ProxyEndpoint {
	name: string;
	internalPath: string;
	externalPath: string;
	method: string;
	description: string;
}

/**
 * Extrae metadata de los comentarios JSDoc de un archivo +server.ts
 */
function extractMetadata(content: string): {
	externalPath: string;
	method: string;
	description: string;
} {
	// Buscar comentario JSDoc al inicio del archivo
	const jsdocMatch = content.match(/\/\*\*([\s\S]*?)\*\//);

	if (!jsdocMatch) {
		return {
			externalPath: '',
			method: 'GET',
			description: ''
		};
	}

	const jsdoc = jsdocMatch[1];

	// Extraer "API Proxy Endpoint: [Nombre]"
	const titleMatch = jsdoc.match(/API Proxy Endpoint:\s*(.+)/);
	const description = titleMatch ? titleMatch[1].trim() : '';

	// Extraer "Endpoint externo: GET /path"
	const externalMatch = jsdoc.match(/Endpoint externo:\s*(\w+)\s+(\/[\w-]+)/);
	const externalPath = externalMatch ? externalMatch[2] : '';
	const method = externalMatch ? externalMatch[1] : 'GET';

	return {
		externalPath,
		method,
		description
	};
}

export const load: PageServerLoad = async () => {
	try {
		const apiDir = join(process.cwd(), 'src/routes/api');
		const entries = await readdir(apiDir, { withFileTypes: true });

		const proxyEndpoints: ProxyEndpoint[] = [];

		for (const entry of entries) {
			// Ignorar archivos (como README.md) y solo procesar directorios
			if (!entry.isDirectory()) {
				continue;
			}

			const endpointName = entry.name;
			const serverFilePath = join(apiDir, endpointName, '+server.ts');

			try {
				// Leer el contenido del archivo +server.ts
				const content = await readFile(serverFilePath, 'utf-8');

				// Extraer metadata del comentario JSDoc
				const metadata = extractMetadata(content);

				proxyEndpoints.push({
					name: endpointName,
					internalPath: `/api/${endpointName}`,
					externalPath: metadata.externalPath || `/${endpointName}`,
					method: metadata.method,
					description: metadata.description || endpointName
				});
			} catch (error) {
				// Si no se puede leer el archivo, continuar con el siguiente
				console.warn(`No se pudo leer el archivo ${serverFilePath}:`, error);
				continue;
			}
		}

		// Ordenar alfabéticamente por nombre
		proxyEndpoints.sort((a, b) => a.name.localeCompare(b.name));

		return {
			proxyEndpoints
		};
	} catch (error) {
		console.error('Error al escanear endpoints proxy:', error);
		return {
			proxyEndpoints: []
		};
	}
};
