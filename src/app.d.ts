import type { UserKind, UserRole } from '$core/users/enums';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			accessToken: string | null;
			user: {
				id: string;
				email: string;
				name: string;
				kind: UserKind;
				roles: UserRole[];
			} | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
