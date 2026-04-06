/**
 * @module auth/requests
 * @description API request functions for the Auth resource.
 * Provides login, registration, token management, and provider linking.
 */

import { get, post, patch, del } from '$core/_shared/helpers';
import type {
	AuthLoginResponse,
	AuthRegisterResponse,
	ChangePasswordDto,
	ConfirmAccountDto,
	CurrentUser,
	LinkProviderDto,
	LoginDto,
	RefreshTokenDto,
	RegisterDto,
	ResendCodeDto,
	UnlinkProviderDto,
	ValidateTokenResponse
} from '$core/auth/types';

/** @internal Base API path for the auth resource. */
const BASE = '/auth';

/**
 * Namespace containing all API request methods for authentication.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument.
 */
export const AUTH_REQUEST = {
	/**
	 * Authenticates a user with email/password or social token.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Login payload.
	 */
	login: (fetchFn: typeof fetch, data: LoginDto): Promise<AuthLoginResponse> =>
		post(fetchFn, `${BASE}/login`, data),

	/**
	 * Registers a new user account.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Registration payload.
	 */
	register: (fetchFn: typeof fetch, data: RegisterDto): Promise<AuthRegisterResponse> =>
		post(fetchFn, `${BASE}/register`, data),

	/**
	 * Refreshes an access token using a refresh token.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Refresh token payload.
	 */
	refreshToken: (fetchFn: typeof fetch, data: RefreshTokenDto): Promise<AuthLoginResponse> =>
		post(fetchFn, `${BASE}/refresh-token`, data),

	/**
	 * Logs out the current user (revokes access token).
	 * @param fetchFn - SvelteKit `fetch`.
	 */
	logout: (fetchFn: typeof fetch): Promise<void> => post(fetchFn, `${BASE}/logout`, {}),

	/**
	 * Changes the password for the currently authenticated user.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Old and new passwords.
	 */
	changePassword: (fetchFn: typeof fetch, data: ChangePasswordDto): Promise<void> =>
		patch(fetchFn, `${BASE}/change-password`, data),

	/**
	 * Confirms a user account with a verification code.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Email and verification code.
	 */
	confirmAccount: (fetchFn: typeof fetch, data: ConfirmAccountDto): Promise<void> =>
		post(fetchFn, `${BASE}/confirm`, data),

	/**
	 * Resends the confirmation code to the user's email.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Email address.
	 */
	resendCode: (fetchFn: typeof fetch, data: ResendCodeDto): Promise<void> =>
		post(fetchFn, `${BASE}/resend-code`, data),

	/**
	 * Links an external authentication provider to the current account.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Provider and token.
	 */
	linkProvider: (fetchFn: typeof fetch, data: LinkProviderDto): Promise<void> =>
		post(fetchFn, `${BASE}/link-provider`, data),

	/**
	 * Unlinks an external authentication provider from the current account.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Provider to unlink.
	 */
	unlinkProvider: (fetchFn: typeof fetch, data: UnlinkProviderDto): Promise<void> =>
		del(fetchFn, `${BASE}/unlink-provider`, data),

	/**
	 * Validates a JWT token (public endpoint).
	 * @param fetchFn - SvelteKit `fetch`.
	 */
	validateToken: (fetchFn: typeof fetch): Promise<ValidateTokenResponse> =>
		get<ValidateTokenResponse>(fetchFn, `${BASE}/validate`),

	/**
	 * Gets the currently authenticated user's info.
	 * @param fetchFn - SvelteKit `fetch`.
	 */
	me: (fetchFn: typeof fetch): Promise<CurrentUser> => get<CurrentUser>(fetchFn, `${BASE}/me`),

	/**
	 * Generates an OAuth state parameter for CSRF protection.
	 * Must be called before redirecting to the OAuth provider.
	 * @param fetchFn - SvelteKit `fetch`.
	 */
	generateOAuthState: (fetchFn: typeof fetch): Promise<{ state: string }> =>
		get<{ state: string }>(fetchFn, `${BASE}/oauth-state`),

	/**
	 * OAuth callback — exchanges authorization code for tokens.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param code - Authorization code from OAuth redirect.
	 * @param state - State parameter for CSRF validation.
	 */
	oauthCallback: (fetchFn: typeof fetch, code: string, state: string): Promise<AuthLoginResponse> =>
		get<AuthLoginResponse>(
			fetchFn,
			`${BASE}/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
		)
};
