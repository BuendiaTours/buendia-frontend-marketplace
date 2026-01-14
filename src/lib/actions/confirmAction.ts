// src/lib/actions/confirmAction.ts
/**
 * Helper para mostrar un diálogo de confirmación antes de ejecutar una acción
 *
 * Uso:
 * import { onConfirm } from '$lib/actions/confirmAction';
 *
 * async function handleDelete(e: MouseEvent) {
 *   await onConfirm(e, {
 *     title: 'Eliminar',
 *     message: '¿Seguro que quieres eliminar este elemento?',
 *     confirmText: 'Eliminar',
 *     cancelText: 'Cancelar',
 *     danger: true
 *   });
 * }
 *
 * <button on:click={handleDelete}>Eliminar</button>
 *
 * Características:
 * - Previene el comportamiento por defecto del evento
 * - Muestra un diálogo de confirmación personalizable
 * - Maneja automáticamente el submit de formularios o navegación de enlaces
 * - Retorna true si se confirmó, false si se canceló
 */

import { confirm } from '$lib/components/AlertDialog';

export interface ConfirmOptions {
	title?: string;
	message?: string;
	confirmText?: string;
	cancelText?: string;
	danger?: boolean;
}

export async function onConfirm(e: MouseEvent, options?: ConfirmOptions): Promise<boolean> {
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
				form.submit();
			}
		}
		return true;
	}

	return false;
}
