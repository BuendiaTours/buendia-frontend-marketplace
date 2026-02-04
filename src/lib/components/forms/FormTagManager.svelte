<script lang="ts">
	import FormErrorMsg from './FormErrorMsg.svelte';
	import MeltComboBox from '../MeltComboBox.svelte';
	import TagComponent from '../Tag.svelte';

	/**
	 * Componente reutilizable para gestión de tags en formularios
	 *
	 * Soporta dos modos de funcionamiento según el tipo de datos:
	 *
	 * ## Modo 1: Objetos (valueType="object" - por defecto)
	 * Para trabajar con objetos que tienen id y name
	 *
	 * Estructura de datos esperada:
	 * ```typescript
	 * tags: [
	 *   { id: "aa0e8400-e29b-41d4-a716-446655440010", name: "Cruceros" },
	 *   { id: "aa0e8400-e29b-41d4-a716-446655440016", name: "Familiar" }
	 * ]
	 *
	 * availableTags: [
	 *   { id: "aa0e8400-e29b-41d4-a716-446655440010", name: "Cruceros" },
	 *   { id: "aa0e8400-e29b-41d4-a716-446655440016", name: "Familiar" },
	 *   { id: "aa0e8400-e29b-41d4-a716-446655440020", name: "Aventura" }
	 * ]
	 * ```
	 *
	 * @example
	 * ```svelte
	 * <FormTagManager
	 *   id="tags"
	 *   label="Tags"
	 *   bind:tags={$form.tags}
	 *   availableTags={data.availableTags}
	 *   error={$errors.tags?._errors}
	 * />
	 * ```
	 *
	 * ## Modo 2: Strings (valueType="string")
	 * Para trabajar con arrays de strings simples (ideal para enums)
	 *
	 * Estructura de datos esperada:
	 * ```typescript
	 * tags: ["VEGAN", "GLUTEN_FREE", "FRESH", "LOCAL"]
	 *
	 * availableTags: [
	 *   { id: "VEGAN", name: "Vegana" },
	 *   { id: "GLUTEN_FREE", name: "Sin gluten" },
	 *   { id: "FRESH", name: "Fresca" },
	 *   { id: "LOCAL", name: "Local" }
	 * ]
	 * ```
	 *
	 * @example
	 * ```svelte
	 * <FormTagManager
	 *   id="additionalOptions"
	 *   label="Opciones adicionales"
	 *   bind:tags={$form.meals[index].additionalOptions}
	 *   availableTags={MEAL_ADDITIONAL_OPTIONS}
	 *   valueType="string"
	 *   error={$errors.meals?.[index]?.additionalOptions?._errors}
	 * />
	 * ```
	 */

	interface TagItem {
		id: string;
		name: string;
	}

	interface AvailableTag {
		id: string;
		name: string;
	}

	interface Props {
		id: string;
		label: string;
		tags: TagItem[] | string[];
		availableTags?: AvailableTag[];
		valueType?: 'object' | 'string';
		error?: string | string[];
		badge?: string;
		placeholder?: string;
		wrapperClass?: string;
		emptyMessage?: string;
		onTagsChange?: () => void;
	}

	let {
		id,
		label,
		tags = $bindable(),
		availableTags = [],
		valueType = 'object',
		error,
		badge,
		placeholder = 'Añade un tag',
		wrapperClass = 'md:col-span-12',
		emptyMessage = 'No hay tags asignados',
		onTagsChange
	}: Props = $props();

	const tagsForCombobox = $derived(
		availableTags
			?.filter((tag) => {
				if (valueType === 'string') {
					return !(tags as string[]).includes(tag.id);
				}
				return !(tags as TagItem[]).some((selectedTag) => selectedTag.id === tag.id);
			})
			.map((tag) => ({
				value: tag.id,
				label: tag.name
			})) || []
	);

	let selectedTagId = $state<string | undefined>(undefined);

	function handleTagSelect(tagId: string | undefined) {
		if (!tagId) return;

		if (valueType === 'string') {
			const tagExists = (tags as string[]).includes(tagId);
			if (tagExists) return;
			tags = [...(tags as string[]), tagId] as string[];
		} else {
			const tagExists = (tags as TagItem[]).some((t) => t.id === tagId);
			if (tagExists) return;

			const selectedTag = availableTags?.find((t) => t.id === tagId);
			if (selectedTag) {
				tags = [
					...(tags as TagItem[]),
					{ id: selectedTag.id, name: selectedTag.name }
				] as TagItem[];
			}
		}

		selectedTagId = undefined;
		onTagsChange?.();
	}

	function removeTag(index: number) {
		if (valueType === 'string') {
			tags = (tags as string[]).filter((_, i) => i !== index) as string[];
		} else {
			tags = (tags as TagItem[]).filter((_, i) => i !== index) as TagItem[];
		}
		onTagsChange?.();
	}
</script>

<div class={wrapperClass}>
	<label class="label flex items-center justify-between text-sm" for={id}>
		<span>{label}</span>
		{#if badge}
			<span class="text-xs opacity-70">{badge}</span>
		{/if}
	</label>

	<div class="rounded-lg border border-base-content/10 p-4">
		<MeltComboBox
			items={tagsForCombobox}
			type="single"
			{placeholder}
			bind:value={selectedTagId}
			onValueChange={handleTagSelect}
		/>

		<div class="mt-4 flex flex-wrap gap-2">
			{#if tags.length === 0}
				<span class="text-sm text-base-content/50">{emptyMessage}</span>
			{:else if valueType === 'string'}
				{#each tags as tag, i}
					{@const stringTag = tag as string}
					{@const availableTag = availableTags?.find((t) => t.id === stringTag)}
					<TagComponent
						name="{id}[{i}]"
						value={stringTag}
						class="badge-accent"
						removable
						onremove={() => removeTag(i)}
					>
						{availableTag?.name || stringTag}
					</TagComponent>
				{/each}
			{:else}
				{#each tags as tag, i}
					{@const objectTag = tag as TagItem}
					<TagComponent
						name="{id}[{i}][id]"
						value={objectTag.id}
						class="badge-accent"
						removable
						onremove={() => removeTag(i)}
					>
						{objectTag.name}
						<input type="hidden" name="{id}[{i}][name]" value={objectTag.name} />
					</TagComponent>
				{/each}
			{/if}
		</div>

		<FormErrorMsg {error} />
	</div>
</div>
