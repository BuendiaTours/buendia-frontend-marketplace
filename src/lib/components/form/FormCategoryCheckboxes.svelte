<script lang="ts">
	import FormErrorMsg from './FormErrorMsg.svelte';

	/**
	 * Componente reutilizable para selección de categorías mediante checkboxes
	 *
	 * @example
	 * ```svelte
	 * <FormCategoryCheckboxes
	 *   id="categories"
	 *   label="Categorías"
	 *   bind:categories={$form.categories}
	 *   availableCategories={data.availableCategories}
	 *   error={$errors.categories?._errors}
	 * />
	 * ```
	 */

	interface CategoryItem {
		id: string;
		name: string;
	}

	interface AvailableCategory {
		id: string;
		name: string;
		slug?: string;
	}

	interface Props {
		id: string;
		label: string;
		categories: CategoryItem[];
		availableCategories?: AvailableCategory[];
		error?: string | string[];
		badge?: string;
		wrapperClass?: string;
	}

	let {
		id,
		label,
		categories = $bindable(),
		availableCategories = [],
		error,
		badge,
		wrapperClass = 'md:col-span-12'
	}: Props = $props();

	function isCategorySelected(categoryId: string): boolean {
		return categories.some((c) => c.id === categoryId);
	}

	function toggleCategory(category: AvailableCategory, checked: boolean) {
		if (checked) {
			categories = [...categories, { id: category.id, name: category.name }];
		} else {
			categories = categories.filter((c) => c.id !== category.id);
		}
	}
</script>

<div class={wrapperClass}>
	<div class="label text-sm" class:flex={badge} class:justify-between={badge}>
		<span>{label}</span>
		{#if badge}
			<span>{badge}</span>
		{/if}
	</div>

	<div class="rounded-lg border border-base-content/10 p-4">
		<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
			{#each availableCategories as category}
				<label class="label cursor-pointer justify-start gap-3">
					<input
						type="checkbox"
						class="checkbox checkbox-primary"
						checked={isCategorySelected(category.id)}
						onchange={(e) => toggleCategory(category, e.currentTarget.checked)}
					/>
					<span class="label-text">{category.name}</span>
					<input
						type="hidden"
						name="{id}[{categories.findIndex((c) => c.id === category.id)}][id]"
						value={category.id}
						disabled={!isCategorySelected(category.id)}
					/>
					<input
						type="hidden"
						name="{id}[{categories.findIndex((c) => c.id === category.id)}][name]"
						value={category.name}
						disabled={!isCategorySelected(category.id)}
					/>
				</label>
			{/each}
		</div>

		<FormErrorMsg {error} />
	</div>
</div>
