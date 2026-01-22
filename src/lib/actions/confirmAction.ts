// src/lib/actions/confirmAction.ts
/**
 * Acción de Svelte para mostrar un diálogo de confirmación antes de ejecutar una acción
 *
 * Uso como Svelte Action (recomendado):
 * import { confirmAction } from '$lib/actions/confirmAction';
 *
 * <button use:confirmAction={{ title: 'Eliminar', danger: true }}>
 *   Eliminar
 * </button>
 *
 * <form action="/delete" method="post">
 *   <button use:confirmAction={{ title: 'Eliminar', message: '¿Seguro?' }}>
 *     Eliminar
 *   </button>
 * </form>
 *
 * Uso como función helper:
 * import { onConfirm } from '$lib/actions/confirmAction';
 *
 * async function handleDelete(e: MouseEvent) {
 *   const confirmed = await onConfirm(e, { title: 'Eliminar', danger: true });
 *   if (confirmed) {
 *     // hacer algo adicional
 *   }
 * }
 *
 * Características:
 * - Previene el comportamiento por defecto del evento
 * - Muestra un diálogo de confirmación personalizable
 * - Maneja automáticamente el submit de formularios o navegación de enlaces
 * - Funciona con botones y enlaces
 */

import { confirm } from '$lib/components/MeltAlertDialog';

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
		await onConfirm(e, options);
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
