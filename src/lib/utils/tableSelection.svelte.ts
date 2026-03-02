import { untrack } from 'svelte';

/**
 * Reusable reactive selection state for list pages with checkboxes.
 *
 * Usage:
 *   const selection = new TableSelection(() => items);
 *
 * Template:
 *   <!-- Header checkbox -->
 *   <input type="checkbox" checked={selection.allSelected} onchange={() => selection.toggleAll()} />
 *
 *   <!-- Row checkbox -->
 *   <input type="checkbox" bind:group={selection.selectedIds} value={item.id} />
 *
 *   <!-- Batch action -->
 *   <button disabled={!selection.hasSelection}>Batch action</button>
 */
export class TableSelection {
	#getItems: () => Array<{ id: string }>;
	selectedIds = $state<string[]>([]);

	constructor(getItems: () => Array<{ id: string }>) {
		this.#getItems = getItems;
		// Auto-reset whenever the items list changes (pagination, filters)
		$effect(() => {
			getItems(); // track reactive dependency
			untrack(() => {
				this.selectedIds = [];
			});
		});
	}

	get hasSelection() {
		return this.selectedIds.length > 0;
	}

	get allSelected() {
		const items = this.#getItems();
		return this.selectedIds.length === items.length && items.length > 0;
	}

	toggleAll() {
		const items = this.#getItems();
		this.selectedIds = this.allSelected ? [] : items.map((i) => i.id);
	}
}
