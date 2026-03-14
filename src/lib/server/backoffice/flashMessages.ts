import type { Cookies } from '@sveltejs/kit';

export type FlashMessageType = 'info' | 'warning' | 'error' | 'success';

export type FlashMessage = {
	type: FlashMessageType;
	message: string;
	code?: string;
};

const FLASH_COOKIE_NAME = 'flash_message';
const COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax' as const,
	maxAge: 60 // 60 segundos
};

/**
 * Establece un flash message que se mostrará en la próxima página
 */
export function setFlashMessage(cookies: Cookies, flash: FlashMessage): void {
	cookies.set(FLASH_COOKIE_NAME, JSON.stringify(flash), COOKIE_OPTIONS);
}

/**
 * Lee y elimina el flash message de las cookies
 */
export function getFlashMessage(cookies: Cookies): FlashMessage | null {
	const flashCookie = cookies.get(FLASH_COOKIE_NAME);

	if (!flashCookie) {
		return null;
	}

	// Eliminar la cookie después de leerla
	cookies.delete(FLASH_COOKIE_NAME, { path: '/' });

	try {
		return JSON.parse(flashCookie) as FlashMessage;
	} catch {
		return null;
	}
}
