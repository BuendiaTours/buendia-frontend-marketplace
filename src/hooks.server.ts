/**
 * @module hooks.server
 * @description SvelteKit server hooks for authentication.
 * - `handle`: Reads auth cookies, populates `event.locals`, and proactively refreshes expiring tokens.
 * - `handleFetch`: Injects the `Authorization: Bearer` header on server-side API calls.
 */

import type { Handle, HandleFetch } from '@sveltejs/kit';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import type { UserKind, UserRole } from '$core/users/enums';
import { AUTH_REQUEST } from '$core/auth/requests';
import {
	getAuthTokens,
	getUserInfo,
	setAuthCookies,
	setUserInfoCookie,
	clearAuthCookies,
	getTokenExpiry
} from '$lib/server/backoffice/auth';

/** Seconds before expiry at which a proactive refresh is attempted. */
const REFRESH_THRESHOLD_SECONDS = 60;

export const handle: Handle = async ({ event, resolve }) => {
	const { accessToken, refreshToken } = getAuthTokens(event.cookies);

	if (!accessToken && !refreshToken) {
		event.locals.accessToken = null;
		event.locals.user = null;
		return resolve(event);
	}

	let currentToken = accessToken;

	// Refresh when: access token expired (cookie gone) OR close to expiry
	const needsRefresh =
		!accessToken ||
		(() => {
			const exp = getTokenExpiry(accessToken);
			const now = Math.floor(Date.now() / 1000);
			return exp && exp - now < REFRESH_THRESHOLD_SECONDS;
		})();

	if (needsRefresh && refreshToken) {
		try {
			const refreshed = await AUTH_REQUEST.refreshToken(fetch, { refreshToken });
			setAuthCookies(event.cookies, refreshed);
			setUserInfoCookie(event.cookies, {
				id: refreshed.user.id,
				email: refreshed.user.email,
				name: refreshed.user.name,
				kind: refreshed.user.kind as UserKind,
				roles: refreshed.user.roles as UserRole[]
			});
			currentToken = refreshed.accessToken;
		} catch {
			clearAuthCookies(event.cookies);
			event.locals.accessToken = null;
			event.locals.user = null;
			return resolve(event);
		}
	}

	event.locals.accessToken = currentToken;
	event.locals.user = getUserInfo(event.cookies);

	return resolve(event);
};

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
	const token = event.locals.accessToken;

	if (token && request.url.startsWith(PUBLIC_API_BASE_URL)) {
		request.headers.set('Authorization', `Bearer ${token}`);
	}

	return fetch(request);
};
