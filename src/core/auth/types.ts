/**
 * @module auth/types
 * @description TypeScript type definitions for the Auth resource.
 * Organised into Responses (read), DTOs (write).
 */

import type { AuthProviderKind } from '$core/auth/enums';
import type { UserKind, UserRole } from '$core/users/enums';

// -- Responses ----------------------------------

/** Response from a successful login or token refresh. */
export type AuthLoginResponse = {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
	user: {
		id: string;
		email: string;
		name: string;
		kind: string;
		roles: string[];
	};
};

/** Response from a successful registration. */
export type AuthRegisterResponse = {
	authIdentityId: string;
	userId: string;
	provider: AuthProviderKind;
	externalUserId: string;
};

/** Response from token validation. */
export type ValidateTokenResponse = {
	expiresIn: number;
	userId: string;
	valid: boolean;
};

/** Response from GET /auth/me. */
export type CurrentUser = {
	id: string;
	email: string;
	name: string;
	kind: UserKind;
	roles: UserRole[];
	linkedProviders: AuthProviderKind[];
};

// -- DTOs (write models) ------------------------

/** Payload for email/password or social login. */
export type LoginDto = {
	provider: AuthProviderKind;
	code?: string;
	email?: string;
	password?: string;
	token?: string;
};

/** Payload for user registration. */
export type RegisterDto = {
	authIdentityId: string;
	userId: string;
	provider: AuthProviderKind;
	name: string;
	email?: string;
	kind?: UserKind;
	password?: string;
	phone?: string;
	token?: string;
};

/** Payload for refreshing an access token. */
export type RefreshTokenDto = {
	refreshToken: string;
};

/** Payload for changing the current user's password. */
export type ChangePasswordDto = {
	oldPassword: string;
	newPassword: string;
};

/** Payload for confirming account with verification code. */
export type ConfirmAccountDto = {
	email: string;
	code: string;
};

/** Payload for resending the confirmation code. */
export type ResendCodeDto = {
	email: string;
};

/** Payload for linking an external provider to the current account. */
export type LinkProviderDto = {
	provider: AuthProviderKind;
	token: string;
};

/** Payload for unlinking an external provider from the current account. */
export type UnlinkProviderDto = {
	provider: AuthProviderKind;
};
