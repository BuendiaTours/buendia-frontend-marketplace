// Helper para usar el MeltAlertDialog desde cualquier parte de la aplicación

type ConfirmOptions = {
	title?: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	danger?: boolean;
};

// Esta función será inyectada por el componente MeltAlertDialog
let confirmFn: ((opts: ConfirmOptions) => Promise<boolean>) | null = null;

export function setConfirmFunction(fn: (opts: ConfirmOptions) => Promise<boolean>) {
	confirmFn = fn;
}

export function confirm(opts: ConfirmOptions): Promise<boolean> {
	if (!confirmFn) {
		throw new Error('MeltAlertDialog no está montado. Asegúrate de incluirlo en tu layout.');
	}
	return confirmFn(opts);
}
