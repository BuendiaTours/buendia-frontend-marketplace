// Helper para usar el AlertDialogMelt desde cualquier parte de la aplicación

type ConfirmOptions = {
	title?: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	danger?: boolean;
};

// Esta función será inyectada por el componente AlertDialogMelt
let confirmFn: ((opts: ConfirmOptions) => Promise<boolean>) | null = null;

export function setConfirmFunction(fn: (opts: ConfirmOptions) => Promise<boolean>) {
	confirmFn = fn;
}

export function confirm(opts: ConfirmOptions): Promise<boolean> {
	if (!confirmFn) {
		throw new Error('AlertDialogMelt no está montado. Asegúrate de incluirlo en tu layout.');
	}
	return confirmFn(opts);
}
