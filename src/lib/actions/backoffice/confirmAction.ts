// src/lib/actions/confirmAction.ts
/**
 * Utilidades para mostrar diálogos de confirmación antes de ejecutar acciones
 *
 * Exporta tres funciones principales:
 *
 * 1. showConfirmDialog(options) - Para confirmaciones simples sin manejo de eventos
 * 2. showConfirmDialogAndSubmit(e, options) - Para confirmaciones con submit automático de formularios
 * 3. confirmAction(node, options) - Svelte action para usar con use:confirmAction
 */

import { confirm } from '$lib/components/backoffice/MeltAlertDialog';

export interface ConfirmOptions {
	title?: string;
	message?: string;
	confirmText?: string;
	cancelText?: string;
	danger?: boolean;
}

/**
 * Muestra un diálogo de confirmación y retorna la elección del usuario
 *
 * Úsalo para confirmaciones simples antes de ejecutar lógica personalizada
 * (ej: eliminar elementos, limpiar datos, ejecutar acciones)
 *
 * NO maneja automáticamente envíos de formularios ni navegación
 *
 * @example
 * async function handleDeleteAll() {
 *   const confirmed = await showConfirmDialog({
 *     title: 'Eliminar todos',
 *     danger: true
 *   });
 *   if (confirmed) {
 *     items = [];
 *   }
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
 * Úsalo cuando necesites confirmación antes de enviar un formulario o seguir un enlace
 * Automáticamente llama preventDefault/stopPropagation y ejecuta la acción si se confirma
 *
 * @example
 * async function handleDelete(e: MouseEvent) {
 *   const confirmed = await showConfirmDialogAndSubmit(e, {
 *     title: 'Eliminar',
 *     danger: true
 *   });
 *   if (confirmed) {
 *     // Acción adicional después del submit
 *   }
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
				// Usar requestSubmit() en lugar de submit() para disparar el evento submit
				// y permitir validaciones HTML5
				if (form.requestSubmit) {
					form.requestSubmit();
				} else {
					// Fallback para navegadores antiguos
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
