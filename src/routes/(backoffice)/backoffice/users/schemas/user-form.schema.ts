import { z } from 'zod/v3';
import { UserKind, UserRole, UserStatus } from '$core/users/enums';

export const userFormSchema = z.object({
	id: z.string(),
	email: z.string().email('Debe ser un email válido'),
	name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
	phone: z.string().min(9, 'El teléfono debe tener al menos 9 caracteres'),
	kind: z.nativeEnum(UserKind, {
		errorMap: () => ({ message: 'Debe seleccionar un tipo válido' })
	}),
	status: z.nativeEnum(UserStatus).optional(),
	roles: z.array(z.nativeEnum(UserRole)).optional()
});

export type UserFormSchema = z.infer<typeof userFormSchema>;
