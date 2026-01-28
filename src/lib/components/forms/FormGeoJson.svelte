<script lang="ts">
	import FormErrorMsg from './FormErrorMsg.svelte';
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';

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
		mapHeight?: string;
	}

	let {
		id,
		label,
		value = $bindable(),
		error,
		badge,
		wrapperClass = 'md:col-span-12',
		mapHeight = '400px'
	}: Props = $props();

	let mapContainer: HTMLDivElement;
	let map: google.maps.Map | null = null;
	let marker: google.maps.Marker | null = null;
	let isMapLoaded = $state(false);
	let mapError = $state<string | null>(null);

	// Coordenadas por defecto (centro de España)
	const defaultCoordinates: [number, number] = [-3.7038, 40.4168];

	// Derived values para los inputs
	const longitude = $derived(value?.coordinates?.[0] ?? defaultCoordinates[0]);
	const latitude = $derived(value?.coordinates?.[1] ?? defaultCoordinates[1]);

	function initializeMap() {
		if (!mapContainer || !window.google) return;

		try {
			const initialPosition = {
				lat: latitude,
				lng: longitude
			};

			map = new google.maps.Map(mapContainer, {
				center: initialPosition,
				zoom: 13,
				mapTypeControl: true,
				streetViewControl: false,
				fullscreenControl: false
			});

			marker = new google.maps.Marker({
				position: initialPosition,
				map: map,
				draggable: true,
				title: 'Ubicación'
			});

			// Actualizar coordenadas cuando se mueve el marcador
			marker.addListener('dragend', () => {
				if (!marker) return;
				const position = marker.getPosition();
				if (position) {
					updateCoordinates(position.lng(), position.lat());
				}
			});

			// Añadir marcador al hacer click en el mapa
			map.addListener('click', (e: google.maps.MapMouseEvent) => {
				if (e.latLng && marker) {
					marker.setPosition(e.latLng);
					updateCoordinates(e.latLng.lng(), e.latLng.lat());
				}
			});

			isMapLoaded = true;
		} catch (err) {
			console.error('Error initializing map:', err);
			mapError = 'Error al cargar el mapa';
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
			marker.setPosition(position);
			map.setCenter(position);
		}
	}

	onMount(() => {
		// Verificar si Google Maps ya está cargado
		if (window.google && window.google.maps) {
			initializeMap();
		} else {
			// Verificar que existe la API key
			const apiKey = env.PUBLIC_GOOGLE_MAPS_API_KEY;
			if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
				mapError = 'Configura PUBLIC_GOOGLE_MAPS_API_KEY en el archivo .env';
				return;
			}

			// Cargar Google Maps API
			const script = document.createElement('script');
			script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
			script.async = true;
			script.defer = true;
			script.onload = () => initializeMap();
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
		<!-- Grid responsive: stack en mobile, 8+4 cols en desktop -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-12">
			<!-- Mapa - 8 columnas en desktop, full width en mobile -->
			<div class="md:col-span-8">
				<div class="relative overflow-hidden rounded-lg">
					{#if mapError}
						<div
							class="flex items-center justify-center bg-base-200 p-8"
							style="height: {mapHeight}"
						>
							<div class="text-center">
								<p class="text-sm text-error">{mapError}</p>
								<p class="mt-2 text-xs text-base-content/50">
									Configura tu API key de Google Maps en el componente
								</p>
							</div>
						</div>
					{:else}
						<div bind:this={mapContainer} style="height: {mapHeight}; width: 100%;">
							{#if !isMapLoaded}
								<div
									class="flex items-center justify-center bg-base-200"
									style="height: {mapHeight}"
								>
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

			<!-- Inputs de coordenadas - 4 columnas en desktop, 2 columnas en mobile -->
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
