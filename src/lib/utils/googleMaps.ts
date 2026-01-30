/**
 * Utilidad para cargar Google Maps API de manera global
 * Evita cargar el script múltiples veces cuando hay varios mapas en la misma página
 */

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

let loadingState: LoadingState = 'idle';
let loadPromise: Promise<void> | null = null;
let apiKey: string | null = null;

/**
 * Carga la API de Google Maps de manera global
 * Si ya está cargada o cargándose, retorna la promesa existente
 */
export async function loadGoogleMapsAPI(key: string): Promise<void> {
	// Si ya está cargada, retornar inmediatamente
	if (loadingState === 'loaded' && (window as any).google?.maps) {
		return Promise.resolve();
	}

	// Si hay un error previo y la key es diferente, reintentar
	if (loadingState === 'error' && key !== apiKey) {
		loadingState = 'idle';
		loadPromise = null;
	}

	// Si ya se está cargando, retornar la promesa existente
	if (loadingState === 'loading' && loadPromise) {
		return loadPromise;
	}

	// Validar API key
	if (!key || key === 'your_google_maps_api_key_here') {
		loadingState = 'error';
		return Promise.reject(new Error('Configura PUBLIC_GOOGLE_MAPS_API_KEY en el archivo .env'));
	}

	apiKey = key;
	loadingState = 'loading';

	loadPromise = new Promise<void>((resolve, reject) => {
		// Verificar si ya está cargado (puede haber sido cargado externamente)
		if ((window as any).google?.maps) {
			loadingState = 'loaded';
			resolve();
			return;
		}

		// Crear script tag
		const script = document.createElement('script');
		script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&libraries=marker`;
		script.async = true;
		script.defer = true;

		script.onload = () => {
			// Esperar un poco para asegurar que google.maps esté disponible
			setTimeout(() => {
				if ((window as any).google?.maps) {
					loadingState = 'loaded';
					resolve();
				} else {
					loadingState = 'error';
					reject(new Error('Error al cargar Google Maps. La API no está disponible.'));
				}
			}, 100);
		};

		script.onerror = () => {
			loadingState = 'error';
			reject(new Error('Error al cargar Google Maps. Verifica la API key.'));
		};

		document.head.appendChild(script);
	});

	return loadPromise;
}

/**
 * Verifica si Google Maps API ya está cargada
 */
export function isGoogleMapsLoaded(): boolean {
	return loadingState === 'loaded' && !!(window as any).google?.maps;
}

/**
 * Obtiene el estado actual de carga
 */
export function getLoadingState(): LoadingState {
	return loadingState;
}
