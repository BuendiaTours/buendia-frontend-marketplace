<script lang="ts">
	import FormErrorMsg from './FormErrorMsg.svelte';

	/**
	 * Componente reutilizable para selección múltiple mediante checkboxes
	 *
	 * @param main_label - Texto del label principal que se muestra encima del grupo de checkboxes
	 * @param id - ID base para generar los IDs únicos de cada checkbox (ej: "categories" genera "checkbox-categories-0", "checkbox-categories-1", etc.)
	 * @param name - Nombre del campo para el formulario HTML. Usar notación de array (ej: "categories[]") para enviar múltiples valores
	 * @param key_title - Clave del objeto JSON que se usará para mostrar el texto visible del checkbox (ej: "name" para mostrar item.name)
	 * @param key_value - Clave del objeto JSON que se usará como value del checkbox (ej: "id" para usar item.id como value)
	 * @param items - Array de items seleccionados actualmente (bindable). Cada item debe tener las propiedades definidas en key_title y key_value
	 * @param availableItems - Array de todos los items disponibles para seleccionar. Cada item debe tener las propiedades definidas en key_title y key_value
	 * @param error - Mensaje(s) de error de validación a mostrar
	 * @param badge - (Opcional) Badge informativo que se muestra al lado del label principal
	 * @param wrapperClass - (Opcional) Clases CSS para el contenedor principal. Por defecto: "md:col-span-12"
	 * @param containerClass - (Opcional) Clases CSS para el contenedor de los checkboxes. Por defecto: "grid grid-cols-1 gap-3 md:grid-cols-2"
	 *
	 * @example
	 * ```svelte
	 * <FormCheckboxGroup
	 *   main_label="Categorías"
	 *   id="categories"
	 *   name="categories[]"
	 *   key_title="name"
	 *   key_value="id"
	 *   bind:items={$form.categories}
	 *   availableItems={data.availableCategories}
	 *   error={$errors.categories?._errors}
	 * />
	 * ```
	 */

	interface Props {
		id: string;
		name: string;
		main_label: string;
		key_title: string;
		key_value: string;
		items: any[];
		availableItems?: any[];
		error?: string | string[];
		badge?: string;
		wrapperClass?: string;
		containerClass?: string;
	}

	let {
		id,
		name,
		main_label,
		key_title,
		key_value,
		items = $bindable(),
		availableItems = [],
		error,
		badge,
		wrapperClass = 'md:col-span-12',
		containerClass = 'grid grid-cols-1 gap-3 md:grid-cols-2'
	}: Props = $props();

	function isItemSelected(itemValue: string): boolean {
		return items.some((item) => item[key_value] === itemValue);
	}

	function toggleItem(item: any, checked: boolean) {
		if (checked) {
			const newItem: any = {};
			newItem[key_value] = item[key_value];
			newItem[key_title] = item[key_title];
			items = [...items, newItem];
		} else {
			items = items.filter((i) => i[key_value] !== item[key_value]);
		}
	}
</script>

<div class={wrapperClass}>
	<div class="label text-sm" class:flex={badge} class:justify-between={badge}>
		<span>{main_label}</span>
		{#if badge}
			<span>{badge}</span>
		{/if}
	</div>

	<div class="rounded-lg border border-base-content/10 p-4">
		<div class={containerClass}>
			{#each availableItems as item, index}
				<label class="label cursor-pointer justify-start gap-3" for="checkbox-{id}-{index}">
					<input
						type="checkbox"
						id="checkbox-{id}-{index}"
						{name}
						value={item[key_value]}
						class="checkbox checkbox-sm"
						checked={isItemSelected(item[key_value])}
						onchange={(e) => toggleItem(item, e.currentTarget.checked)}
					/>
					<span class="label-text">{item[key_title]}</span>
				</label>
			{/each}
		</div>

		<FormErrorMsg {error} />
	</div>
</div>
