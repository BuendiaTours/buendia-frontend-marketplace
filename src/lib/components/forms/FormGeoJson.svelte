<script lang="ts">
	import FormErrorMsg from './FormErrorMsg.svelte';
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { InfoEmpty, Search } from 'svelte-iconoir';

	/**
	 * Componente reutilizable para editar coordenadas GeoJSON con mapa de Google Maps
	 *
	 * @example
	 * ```svelte
	 * <FormGeoJson
	 *   id="location"
	 *   label="Ubicación"
	 *   bind:value={$form.location}
	 *   error={$errors.location}
	 * />
	 * ```
	 */

	interface GeoJsonPoint {
		type: 'Point';
		coordinates: [number, number]; // [longitude, latitude]
	}

	interface Props {
		id: string;
		label: string;
		value: GeoJsonPoint | null;
		error?: string | string[];
		badge?: string;
		wrapperClass?: string;
		mapClass?: string;
	}

	let {
		id,
		label,
		value = $bindable(),
		error,
		badge,
		wrapperClass = 'md:col-span-12',
		mapClass = 'h-[400px]'
	}: Props = $props();

	let searchQuery = $state('');
	let isSearching = $state(false);
	let searchError = $state<string | null>(null);

	let mapContainer: HTMLDivElement;
	let map: any = null;
	let marker: any = null;
	let isMapLoaded = $state(false);
	let mapError = $state<string | null>(null);

	// Coordenadas por defecto (centro de España)
	const defaultCoordinates: [number, number] = [-3.7038, 40.4168];

	// Derived values para los inputs
	const longitude = $derived(value?.coordinates?.[0] ?? defaultCoordinates[0]);
	const latitude = $derived(value?.coordinates?.[1] ?? defaultCoordinates[1]);

	function initializeMap() {
		if (!mapContainer || !(window as any).google) return;

		try {
			const initialPosition = {
				lat: latitude,
				lng: longitude
			};

			map = new (window as any).google.maps.Map(mapContainer, {
				center: initialPosition,
				zoom: 13,
				mapTypeControl: true,
				streetViewControl: false,
				fullscreenControl: false,
				mapId: `map-${id}`
			});

			try {
				const { AdvancedMarkerElement } = (window as any).google.maps.marker;
				if (AdvancedMarkerElement) {
					marker = new AdvancedMarkerElement({
						position: initialPosition,
						map: map,
						title: 'Ubicación',
						gmpDraggable: true
					});

					marker.addListener('dragend', (event: any) => {
						if (!marker) return;
						const position = marker.position;
						if (position && position.lat !== undefined && position.lng !== undefined) {
							const lat = typeof position.lat === 'function' ? position.lat() : position.lat;
							const lng = typeof position.lng === 'function' ? position.lng() : position.lng;
							updateCoordinates(lng, lat);
						}
					});

					map.addListener('click', (e: any) => {
						if (e.latLng && marker) {
							marker.position = e.latLng;
							updateCoordinates(e.latLng.lng(), e.latLng.lat());
						}
					});
				} else {
					throw new Error('AdvancedMarkerElement not available');
				}
			} catch (advancedMarkerError) {
				console.warn(
					'AdvancedMarkerElement not available, falling back to deprecated Marker:',
					advancedMarkerError
				);
				// Fallback to deprecated Marker API
				marker = new (window as any).google.maps.Marker({
					position: initialPosition,
					map: map,
					draggable: true,
					title: 'Ubicación'
				});

				marker.addListener('dragend', () => {
					if (!marker) return;
					const position = marker.getPosition();
					if (position) {
						updateCoordinates(position.lng(), position.lat());
					}
				});

				map.addListener('click', (e: any) => {
					if (e.latLng && marker) {
						marker.setPosition(e.latLng);
						updateCoordinates(e.latLng.lng(), e.latLng.lat());
					}
				});
			}

			isMapLoaded = true;
		} catch (err) {
			console.error('Error initializing map:', err);
			mapError = 'Error al cargar el mapa';
		}
	}

	async function searchLocation() {
		if (!searchQuery.trim() || !(window as any).google) return;

		isSearching = true;
		searchError = null;

		try {
			const geocoder = new (window as any).google.maps.Geocoder();
			const result = await new Promise<any>((resolve, reject) => {
				geocoder.geocode({ address: searchQuery }, (results: any, status: string) => {
					if (status === 'OK' && results) {
						resolve(results);
					} else {
						reject({ status, results });
					}
				});
			});

			if (result.length > 0 && result[0].geometry?.location) {
				const location = result[0].geometry.location;
				const lat = location.lat();
				const lng = location.lng();

				updateCoordinates(lng, lat);
				if (map) {
					map.setCenter({ lat, lng });
					map.setZoom(13);
				}

				// Actualizar marcador
				if (marker) {
					if (marker.position !== undefined) {
						marker.position = { lat, lng };
					} else if (marker.setPosition) {
						marker.setPosition({ lat, lng });
					}
				}

				searchQuery = '';
			}
		} catch (err: any) {
			console.error('Error searching location:', err);

			// Check if it's a Geocoding API permission error
			if (err?.status === 'REQUEST_DENIED') {
				searchError =
					'La API key no tiene permisos de Geocoding. Activa "Geocoding API" en Google Cloud Console.';
			} else if (err?.status === 'ZERO_RESULTS') {
				searchError = 'No se encontró la ubicación. Intenta con otra ciudad o dirección.';
			} else if (err?.status === 'OVER_QUERY_LIMIT') {
				searchError = 'Se ha excedido el límite de consultas de la API. Intenta más tarde.';
			} else if (err?.status === 'INVALID_REQUEST') {
				searchError = 'Solicitud inválida. Verifica el formato de la búsqueda.';
			} else {
				searchError = 'No se encontró la ubicación. Intenta con otra ciudad o dirección.';
			}
		} finally {
			isSearching = false;
		}
	}

	function handleSearchKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			searchLocation();
		}
	}

	function updateCoordinates(lng: number, lat: number) {
		value = {
			type: 'Point',
			coordinates: [Number(lng.toFixed(6)), Number(lat.toFixed(6))]
		};
	}

	function handleLongitudeChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const lng = parseFloat(target.value);
		if (!isNaN(lng)) {
			updateCoordinates(lng, latitude);
			updateMarkerPosition();
		}
	}

	function handleLatitudeChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const lat = parseFloat(target.value);
		if (!isNaN(lat)) {
			updateCoordinates(longitude, lat);
			updateMarkerPosition();
		}
	}

	function updateMarkerPosition() {
		if (marker && map) {
			const position = { lat: latitude, lng: longitude };

			if (marker.position !== undefined) {
				marker.position = position;
			} else if (marker.setPosition) {
				marker.setPosition(position);
			}

			map.setCenter(position);
		}
	}

	onMount(() => {
		// Verificar si Google Maps ya está cargado
		if ((window as any).google && (window as any).google.maps) {
			initializeMap();
		} else {
			// Verificar que existe la API key
			const apiKey = env.PUBLIC_GOOGLE_MAPS_API_KEY;
			if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
				mapError = 'Configura PUBLIC_GOOGLE_MAPS_API_KEY en el archivo .env';
				return;
			}

			// Cargar Google Maps API con async loading y marker library
			const script = document.createElement('script');
			script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&libraries=marker`;
			script.async = true;
			script.defer = true;
			script.onload = () => {
				setTimeout(() => {
					if ((window as any).google && (window as any).google.maps) {
						initializeMap();
					} else {
						mapError = 'Error al cargar Google Maps. La API no está disponible.';
					}
				}, 100);
			};
			script.onerror = () => {
				mapError = 'Error al cargar Google Maps. Verifica la API key.';
			};
			document.head.appendChild(script);
		}
	});
</script>

<div class={wrapperClass}>
	<label class="label flex items-center justify-between text-sm" for={id}>
		<span>{label}</span>
		{#if badge}
			<span class="text-xs opacity-70">{badge}</span>
		{/if}
	</label>

	<div class="rounded-lg border border-base-content/10 p-4">
		<div class="mb-4">
			<div class="relative">
				<input
					type="text"
					placeholder="Buscar ciudad o dirección (ej: Oviedo, Madrid...)"
					class="input input-sm w-full pr-20"
					bind:value={searchQuery}
					onkeydown={handleSearchKeydown}
					disabled={isSearching || !isMapLoaded}
				/>
				<button
					type="button"
					class="btn absolute top-0 right-0 btn-ghost btn-sm"
					onclick={searchLocation}
					disabled={isSearching || !isMapLoaded || !searchQuery.trim()}
				>
					{#if isSearching}
						<span class="loading loading-xs loading-spinner"></span>
					{:else}
						<Search class="size-4" />
					{/if}
				</button>
			</div>

			<!-- Mensaje de advertencia -->
			<div class="mt-2 flex items-center gap-2 text-xs text-warning">
				<InfoEmpty class="size-4" />
				<span
					>Este buscador es solo para facilitar la ubicación del punto. No se guardará esta
					información.</span
				>
			</div>

			{#if searchError}
				<div class="mt-2 text-xs text-error">{searchError}</div>
			{/if}
		</div>

		<!-- Grid responsive: stack en mobile, 8+4 cols en desktop -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-12">
			<!-- Mapa - 8 columnas en desktop, full width en mobile -->
			<div class="md:col-span-8">
				<div class="relative overflow-hidden rounded-lg">
					{#if mapError}
						<div class="flex items-center justify-center bg-base-200 p-8 {mapClass}">
							<div class="text-center">
								<p class="text-sm text-error">{mapError}</p>
								<p class="mt-2 text-xs text-base-content/50">
									Configura tu API key de Google Maps en el componente
								</p>
							</div>
						</div>
					{:else}
						<div bind:this={mapContainer} class="w-full {mapClass}">
							{#if !isMapLoaded}
								<div class="flex items-center justify-center bg-base-200 {mapClass}">
									<span class="loading loading-lg loading-spinner"></span>
								</div>
							{/if}
						</div>
					{/if}
				</div>

				<div class="mt-2 text-xs text-base-content/50">
					Haz clic en el mapa o arrastra el marcador para cambiar la ubicación
				</div>
			</div>

			<!-- Inputs de coordenadas -->
			<div class="md:col-span-4">
				<div class="grid grid-cols-2 gap-4 md:grid-cols-1">
					<div>
						<label class="label text-xs" for="{id}-longitude">
							<span>Longitud</span>
						</label>
						<input
							type="number"
							id="{id}-longitude"
							name="{id}.coordinates[0]"
							class="input input-sm w-full"
							class:input-error={error}
							value={longitude}
							step="0.000001"
							oninput={handleLongitudeChange}
						/>
					</div>
					<div>
						<label class="label text-xs" for="{id}-latitude">
							<span>Latitud</span>
						</label>
						<input
							type="number"
							id="{id}-latitude"
							name="{id}.coordinates[1]"
							class="input input-sm w-full"
							class:input-error={error}
							value={latitude}
							step="0.000001"
							oninput={handleLatitudeChange}
						/>
					</div>
				</div>
			</div>
		</div>

		<!-- Hidden input para el tipo -->
		<input type="hidden" name="{id}.type" value="Point" />

		<FormErrorMsg {error} />
	</div>
</div>
