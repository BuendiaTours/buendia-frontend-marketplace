// src/lib/ui/confirm.svelte.ts
type ConfirmOptions = {
	title?: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	danger?: boolean;
};

type ConfirmState = {
	open: boolean;
	title: string;
	message: string;
	confirmText: string;
	cancelText: string;
	danger: boolean;
	resolve?: (value: boolean) => void;
};

export const confirmState = $state<ConfirmState>({
	open: false,
	title: 'Confirmar',
	message: '',
	confirmText: 'Aceptar',
	cancelText: 'Cancelar',
	danger: false
});

export function confirm(opts: ConfirmOptions): Promise<boolean> {
	return new Promise((resolve) => {
		confirmState.open = true;
		confirmState.title = opts.title ?? 'Confirmar';
		confirmState.message = opts.message;
		confirmState.confirmText = opts.confirmText ?? 'Aceptar';
		confirmState.cancelText = opts.cancelText ?? 'Cancelar';
		confirmState.danger = opts.danger ?? false;
		confirmState.resolve = resolve;
	});
}

export function confirmClose(result: boolean) {
	confirmState.open = false;
	confirmState.resolve?.(result);
	confirmState.resolve = undefined;
}
