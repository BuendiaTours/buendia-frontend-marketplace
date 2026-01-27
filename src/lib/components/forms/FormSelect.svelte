<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import FormErrorMsg from './FormErrorMsg.svelte';

	/**
	 * Componente reutilizable para campos select en formularios
	 * Soporta opciones estáticas u opciones cargadas desde una API
	 *
	 * @example
	 * ```svelte
	 * // Select con opciones estáticas
	 * <FormSelect
	 *   id="status"
	 *   label="Estado"
	 *   bind:value={$form.status}
	 *   error={$errors.status}
	 *   options={[
	 *     { id: 'ACTIVE', name: 'Activo' },
	 *     { id: 'INACTIVE', name: 'Inactivo' }
	 *   ]}
	 * />
	 *
	 * // Select con opciones desde API
	 * <FormSelect
	 *   id="kind"
	 *   label="Tipo"
	 *   bind:value={$form.kind}
	 *   error={$errors.kind}
	 *   apiEndpoint="http://localhost:3333/destination-kind"
	 *   placeholder="Selecciona un tipo"
	 * />
	 * ```
	 */

	interface Option {
		id: string;
		name: string;
	}

	interface Props {
		id: string;
		label: string;
		value: string | undefined;
		error?: string | string[];
		options?: Option[];
		apiEndpoint?: string;
		placeholder?: string;
		disabled?: boolean;
		wrapperClass?: string;
		[key: string]: any;
	}

	let {
		id,
		label,
		value = $bindable(),
		error,
		options = [],
		apiEndpoint,
		placeholder = 'Selecciona una opción',
		disabled = false,
		wrapperClass = 'md:col-span-12',
		...restProps
	}: Props = $props();

	let loadedOptions = $state<Option[]>([]);
	let loading = $state(false);
	let loadError = $state(false);

	const finalOptions = $derived(apiEndpoint ? loadedOptions : options);

	onMount(async () => {
		if (apiEndpoint) {
			loading = true;
			loadError = false;

			try {
				const response = await fetch(apiEndpoint);
				if (response.ok) {
					const data: Option[] = await response.json();
					loadedOptions = data;
				} else {
					loadError = true;
					console.error('Error cargando opciones del select:', response.statusText);
				}
			} catch (err) {
				loadError = true;
				console.error('Error cargando opciones del select:', err);
			} finally {
				loading = false;
			}
		}
	});
</script>

<div class={wrapperClass}>
	<label class="label text-sm" for={id}>
		<span>{label}</span>
	</label>
	<select
		{id}
		name={id}
		class="select w-full"
		class:select-error={error}
		bind:value
		disabled={disabled || loading}
		{...restProps}
	>
		<option value="" disabled selected={!value}>
			{loading ? 'Cargando...' : loadError ? 'Error al cargar opciones' : placeholder}
		</option>
		{#each finalOptions as option}
			<option value={option.id}>{option.name}</option>
		{/each}
	</select>
	<FormErrorMsg {error} />
</div>
