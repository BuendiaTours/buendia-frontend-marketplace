<script lang="ts">
	import * as m from '$paraglide/messages';
	import FormErrorMsg from './FormErrorMsg.svelte';
	import { InfoCircle, Magnifier } from '$lib/icons/Linear';
	import { GoogleMapController } from '$lib/utils/googleMapsMarker.svelte';
	import {
		DEFAULT_COORDINATES,
		DEFAULT_GEOJSON_CONFIG,
		type FormGeoJsonConfig,
		type GeoJsonPoint
	} from '$lib/utils/googleMapsTypes';

	/**
	 * Reusable GeoJSON coordinate editor with an embedded Google Map.
	 * The map supports click-to-place, marker dragging, manual coordinate input,
	 * and optional geocoding search. Writes a GeoJSON Point back to the parent via $bindable.
	 *
	 * @example Basic usage
	 * ```svelte
	 * <FormGeoJson id="location" label="Ubicacion" bind:value={$form.location} error={$errors.location} />
	 * ```
	 *
	 * @example With search box
	 * ```svelte
	 * <FormGeoJson id="location" label="Ubicacion" bind:value={$form.location} config={{ showSearchBox: true }} />
	 * ```
	 */

	type Props = {
		id: string;
		label: string;
		value: GeoJsonPoint | null;
		error?: string | string[];
		badge?: string;
		wrapperClass?: string;
		mapClass?: string;
		config?: Partial<FormGeoJsonConfig>;
	};

	let {
		id,
		label,
		value = $bindable(),
		error,
		badge,
		wrapperClass = 'md:col-span-12',
		mapClass = 'h-[400px]',
		config = {}
	}: Props = $props();

	const cfg = $derived({ ...DEFAULT_GEOJSON_CONFIG, ...config });

	let searchQuery = $state('');
	// eslint-disable-next-line svelte/no-top-level-browser-globals -- type-only usage for bind:this
	let mapContainer = $state<HTMLDivElement>();

	const longitude = $derived(value?.coordinates?.[0] ?? DEFAULT_COORDINATES[0]);
	const latitude = $derived(value?.coordinates?.[1] ?? DEFAULT_COORDINATES[1]);

	const controller = new GoogleMapController({
		onCoordinatesChange: (point) => {
			value = point;
		}
	});

	// Initialize map when container DOM element is available
	$effect(() => {
		if (!mapContainer) return;
		controller.init({ container: mapContainer, id, config });
		return () => controller.destroy();
	});

	// Sync external value changes to the map (separate effect to avoid triggering re-init)
	$effect(() => {
		if (value && controller.isLoaded) {
			controller.syncFromValue(value);
		}
	});

	async function handleSearch() {
		await controller.searchLocation(searchQuery);
		if (!controller.searchError) searchQuery = '';
	}

	function handleSearchKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleSearch();
		}
	}

	function handleLongitudeChange(e: Event) {
		const lng = parseFloat((e.target as HTMLInputElement).value);
		if (!isNaN(lng)) controller.setPosition(lng, latitude);
	}

	function handleLatitudeChange(e: Event) {
		const lat = parseFloat((e.target as HTMLInputElement).value);
		if (!isNaN(lat)) controller.setPosition(longitude, lat);
	}
</script>

<div class={wrapperClass}>
	<label class="label flex items-center justify-between text-sm" for={id}>
		<span>{label}</span>
		{#if badge}
			<span class="text-xs opacity-70">{badge}</span>
		{/if}
	</label>

	<div class="card p-4">
		{#if cfg.showSearchBox}
			<div class="mb-4">
				<div class="relative">
					<input
						type="text"
						placeholder={m.geoJson_searchPlaceholder()}
						class="input input-sm w-full pr-20"
						bind:value={searchQuery}
						onkeydown={handleSearchKeydown}
						disabled={controller.isSearching || !controller.isLoaded || !cfg.enableGeocoding}
					/>
					<button
						type="button"
						class="btn btn-ghost btn-sm absolute top-0 right-0"
						onclick={handleSearch}
						disabled={controller.isSearching ||
							!controller.isLoaded ||
							!searchQuery.trim() ||
							!cfg.enableGeocoding}
					>
						{#if controller.isSearching}
							<span class="loading loading-xs loading-spinner"></span>
						{:else}
							<Magnifier class="size-5" />
						{/if}
					</button>
				</div>

				<div class="text-warning mt-2 flex items-center gap-2 text-xs">
					<InfoCircle class="size-4" />
					<span>{m.geoJson_searchHelperText()}</span>
				</div>

				{#if controller.searchError}
					<div class="text-error mt-2 text-xs">{controller.searchError}</div>
				{/if}
			</div>
		{/if}

		<!-- Map container always in the DOM to prevent $effect re-init cycles -->
		<div class="relative overflow-hidden rounded-lg">
			<div
				bind:this={mapContainer}
				class="w-full {mapClass}"
				class:invisible={!!controller.error}
			></div>

			{#if controller.error}
				<div class="bg-base-200 absolute inset-0 flex items-center justify-center p-8 {mapClass}">
					<div class="text-center">
						<p class="text-error text-sm">{controller.error}</p>
						<p class="text-base-content/50 mt-2 text-xs">
							{m.geoJson_configureApiKey()}
						</p>
					</div>
				</div>
			{:else if !controller.isLoaded}
				<div class="bg-base-200 absolute inset-0 flex items-center justify-center {mapClass}">
					<span class="loading loading-lg loading-spinner"></span>
				</div>
			{/if}
		</div>

		<div class="mt-2 flex items-end gap-4">
			<div class="text-base-content/50 flex-1 text-xs">
				{m.geoJson_mapClickHint()}
			</div>

			{#if cfg.showCoordinatesDisplay}
				<div class="flex items-end gap-3">
					<div>
						<label class="label text-xs" for="{id}-latitude">
							<span>{m.geoJson_latitude()}</span>
						</label>
						<input
							type="number"
							id="{id}-latitude"
							name="{id}.coordinates[1]"
							class="input input-sm w-36"
							class:input-error={error}
							value={latitude}
							step="0.000001"
							oninput={handleLatitudeChange}
						/>
					</div>
					<div>
						<label class="label text-xs" for="{id}-longitude">
							<span>{m.geoJson_longitude()}</span>
						</label>
						<input
							type="number"
							id="{id}-longitude"
							name="{id}.coordinates[0]"
							class="input input-sm w-36"
							class:input-error={error}
							value={longitude}
							step="0.000001"
							oninput={handleLongitudeChange}
						/>
					</div>
				</div>
			{/if}
		</div>

		<input type="hidden" name="{id}.type" value="Point" />

		<FormErrorMsg {error} />
	</div>
</div>
