<script lang="ts">
	import FormErrorMsg from './FormErrorMsg.svelte';
	import MeltComboBox from '../MeltComboBox.svelte';
	import TagComponent from '../Tag.svelte';

	/**
	 * Componente reutilizable para gestión de tags en formularios
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
		tags: TagItem[];
		availableTags?: AvailableTag[];
		error?: string | string[];
		badge?: string;
		placeholder?: string;
		wrapperClass?: string;
		emptyMessage?: string;
	}

	let {
		id,
		label,
		tags = $bindable(),
		availableTags = [],
		error,
		badge,
		placeholder = 'Añade un tag',
		wrapperClass = 'md:col-span-12',
		emptyMessage = 'No hay tags asignados'
	}: Props = $props();

	const tagsForCombobox = $derived(
		availableTags?.map((tag) => ({
			value: tag.id,
			label: tag.name
		})) || []
	);

	let selectedTagId = $state<string | undefined>(undefined);

	function handleTagSelect(tagId: string | undefined) {
		if (!tagId) return;

		const tagExists = tags.some((t) => t.id === tagId);
		if (tagExists) return;

		const selectedTag = availableTags?.find((t) => t.id === tagId);
		if (selectedTag) {
			tags = [...tags, { id: selectedTag.id, name: selectedTag.name }];
		}

		selectedTagId = undefined;
	}

	function removeTag(index: number) {
		tags = tags.filter((_, i) => i !== index);
	}
</script>

<div class={wrapperClass}>
	<label class="label text-sm" class:flex={badge} class:justify-between={badge} for={id}>
		<span>{label}</span>
		{#if badge}
			<span>{badge}</span>
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
			{:else}
				{#each tags as tag, i}
					<TagComponent
						name="{id}[{i}][id]"
						value={tag.id}
						class="badge-primary"
						removable
						onremove={() => removeTag(i)}
					>
						{tag.name}
						<input type="hidden" name="{id}[{i}][name]" value={tag.name} />
					</TagComponent>
				{/each}
			{/if}
		</div>

		<FormErrorMsg {error} />
	</div>
</div>
