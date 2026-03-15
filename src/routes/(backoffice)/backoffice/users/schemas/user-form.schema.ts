import { z } from 'zod/v3';
import { UserRole, UserStatus } from '$core/users/enums';

export const userFormSchema = z.object({
	id: z.string(),
	name: z.string().min(2).max(100),
	email: z.string().email(),
	phone: z.string().min(9).max(30),
	status: z.nativeEnum(UserStatus).optional(),
	roles: z.array(z.nativeEnum(UserRole)).default([])
});

export type UserFormSchema = z.infer<typeof userFormSchema>;
