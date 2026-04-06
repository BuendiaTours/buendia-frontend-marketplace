/**
 * @module server/backoffice/auth
 * @description Server-side cookie helpers for backoffice authentication.
 * Manages httpOnly cookies for access token, refresh token, and user info.
 */

import type { Cookies } from '@sveltejs/kit';
import type { UserKind, UserRole } from '$core/users/enums';

type AuthTokens = {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
};

type UserInfo = {
	id: string;
	email: string;
	name: string;
	kind: UserKind;
	roles: UserRole[];
};

const BO_ACCESS_TOKEN = 'bo_access_token';
const BO_REFRESH_TOKEN = 'bo_refresh_token';
const BO_USER_INFO = 'bo_user_info';

const COOKIE_PATH = '/backoffice';

const BASE_OPTIONS = {
	path: COOKIE_PATH,
	httpOnly: true,
	sameSite: 'lax' as const,
	secure: !import.meta.env.DEV
};

const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

/**
 * Sets auth cookies after a successful login or token refresh.
 * @param cookies - SvelteKit cookies API.
 * @param tokens - Access token, refresh token, and TTL from the API response.
 */
export function setAuthCookies(cookies: Cookies, tokens: AuthTokens): void {
	cookies.set(BO_ACCESS_TOKEN, tokens.accessToken, {
		...BASE_OPTIONS,
		maxAge: tokens.expiresIn
	});
	cookies.set(BO_REFRESH_TOKEN, tokens.refreshToken, {
		...BASE_OPTIONS,
		maxAge: REFRESH_TOKEN_MAX_AGE
	});
}

/**
 * Reads auth tokens from cookies.
 * @param cookies - SvelteKit cookies API.
 */
export function getAuthTokens(cookies: Cookies): {
	accessToken: string | null;
	refreshToken: string | null;
} {
	return {
		accessToken: cookies.get(BO_ACCESS_TOKEN) ?? null,
		refreshToken: cookies.get(BO_REFRESH_TOKEN) ?? null
	};
}

/** Deletes all auth-related cookies. */
export function clearAuthCookies(cookies: Cookies): void {
	cookies.delete(BO_ACCESS_TOKEN, { path: COOKIE_PATH });
	cookies.delete(BO_REFRESH_TOKEN, { path: COOKIE_PATH });
	cookies.delete(BO_USER_INFO, { path: COOKIE_PATH });
}

/**
 * Stores essential user info in an httpOnly cookie to avoid calling /auth/me on every request.
 * @param cookies - SvelteKit cookies API.
 * @param user - User profile subset.
 */
export function setUserInfoCookie(cookies: Cookies, user: UserInfo): void {
	cookies.set(BO_USER_INFO, JSON.stringify(user), {
		...BASE_OPTIONS,
		maxAge: REFRESH_TOKEN_MAX_AGE
	});
}

/**
 * Reads user info from the cookie.
 * @param cookies - SvelteKit cookies API.
 */
export function getUserInfo(cookies: Cookies): UserInfo | null {
	const raw = cookies.get(BO_USER_INFO);
	if (!raw) return null;

	try {
		return JSON.parse(raw) as UserInfo;
	} catch {
		return null;
	}
}

/**
 * Decodes the JWT payload and returns the `exp` claim (seconds since epoch).
 * Does NOT verify the signature — validation is the backend's responsibility.
 */
export function getTokenExpiry(token: string): number | null {
	try {
		const payload = token.split('.')[1];
		const decoded = JSON.parse(atob(payload));
		return typeof decoded.exp === 'number' ? decoded.exp : null;
	} catch {
		return null;
	}
}
