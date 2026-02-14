import { z } from 'zod/v3';

export const userFormSchema = z.object({
	id: z.string(),
	email: z.string().email('Debe ser un email válido'),
	name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
	phone: z.string().min(9, 'El teléfono debe tener al menos 9 caracteres'),
	kind: z.enum(['CLIENT', 'ADMIN'], {
		errorMap: () => ({ message: 'Debe seleccionar un tipo válido' })
	}),
	status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
	roles: z.array(z.enum(['SUPPLY', 'CUSTOMER_ATTENDANT', 'FINANCES', 'CONTENT'])).optional()
});

export type UserFormSchema = z.infer<typeof userFormSchema>;
