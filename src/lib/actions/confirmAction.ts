/**
 * Utilidades para mostrar diálogos de confirmación antes de ejecutar acciones
 *
 * Exporta tres funciones principales:
 *
 * 1. showConfirmDialog(options) - Para confirmaciones simples sin manejo de eventos
 * 2. showConfirmDialogAndSubmit(e, options) - Para confirmaciones con submit automático de formularios
 * 3. confirmAction(node, options) - Svelte action para usar con use:confirmAction
 */

import { confirm } from '$lib/components/MeltAlertDialog';

export type ConfirmOptions = {
	title?: string;
	message?: string;
	confirmText?: string;
	cancelText?: string;
	danger?: boolean;
};

/**
 * Muestra un diálogo de confirmación y retorna la elección del usuario
 *
 * @example
 * async function handleDelete() {
 *   const confirmed = await showConfirmDialog({
 *     title: 'Eliminar',
 *     danger: true
 *   });
 *   if (confirmed) { ... }
 * }
 */
export async function showConfirmDialog(options?: ConfirmOptions): Promise<boolean> {
	return await confirm({
		title: options?.title || 'Confirmar',
		message: options?.message || '¿Estás seguro?',
		confirmText: options?.confirmText || 'Confirmar',
		cancelText: options?.cancelText || 'Cancelar',
		danger: options?.danger || false
	});
}

/**
 * Muestra un diálogo de confirmación y maneja automáticamente el submit de formularios o navegación
 *
 * @example
 * async function handleDelete(e: MouseEvent) {
 *   await showConfirmDialogAndSubmit(e, { title: 'Eliminar', danger: true });
 * }
 */
export async function showConfirmDialogAndSubmit(
	e: MouseEvent,
	options?: ConfirmOptions
): Promise<boolean> {
	e.preventDefault();
	e.stopPropagation();

	const ok = await confirm({
		title: options?.title || 'Confirmar',
		message: options?.message || '¿Estás seguro?',
		confirmText: options?.confirmText || 'Confirmar',
		cancelText: options?.cancelText || 'Cancelar',
		danger: options?.danger || false
	});

	if (ok) {
		const target = e.target as HTMLElement;

		if (!target) {
			console.error('No target element found');
			return false;
		}

		if (target.tagName === 'A') {
			const href = (target as HTMLAnchorElement).href;
			window.location.href = href;
		} else if (target.tagName === 'BUTTON') {
			const form = target.closest('form');
			if (form) {
				if (form.requestSubmit) {
					form.requestSubmit();
				} else {
					form.submit();
				}
			}
		}
		return true;
	}

	return false;
}

export function confirmAction(node: HTMLElement, options?: ConfirmOptions) {
	async function handleClick(e: MouseEvent) {
		await showConfirmDialogAndSubmit(e, options);
	}

	node.addEventListener('click', handleClick);

	return {
		update(newOptions?: ConfirmOptions) {
			options = newOptions;
		},
		destroy() {
			node.removeEventListener('click', handleClick);
		}
	};
}
