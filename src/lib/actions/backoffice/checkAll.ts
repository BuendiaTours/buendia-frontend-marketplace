// src/lib/actions/checkAll.ts
/**
 * Acción de Svelte para implementar check/uncheck all en tablas
 *
 * Uso:
 * <input type="checkbox" use:checkAll />
 *
 * Características:
 * - Solo afecta checkboxes en la misma columna (mismo índice de <td>)
 * - Solo afecta checkboxes dentro de la misma tabla
 * - Funciona con múltiples tablas en la misma página
 * - Funciona con múltiples columnas de checkboxes en la misma tabla
 */

export function checkAll(node: HTMLInputElement) {
	function handleChange(e: Event) {
		const checkbox = e.target as HTMLInputElement;
		const isChecked = checkbox.checked;

		// Encontrar la tabla padre
		const table = checkbox.closest('table');
		if (!table) return;

		// Encontrar el <th> que contiene este checkbox
		const th = checkbox.closest('th');
		if (!th) return;

		// Encontrar el índice de la columna
		const headerRow = th.parentElement as HTMLTableRowElement;
		const columnIndex = Array.from(headerRow.children).indexOf(th);

		// Encontrar todos los checkboxes en la misma columna del tbody
		const tbody = table.querySelector('tbody');
		if (!tbody) return;

		const rows = tbody.querySelectorAll('tr');
		rows.forEach((row) => {
			const cell = row.children[columnIndex] as HTMLTableCellElement;
			if (cell) {
				const cellCheckbox = cell.querySelector('input[type="checkbox"]') as HTMLInputElement;
				if (cellCheckbox) {
					cellCheckbox.checked = isChecked;
				}
			}
		});
	}

	node.addEventListener('change', handleChange);

	return {
		destroy() {
			node.removeEventListener('change', handleChange);
		}
	};
}
