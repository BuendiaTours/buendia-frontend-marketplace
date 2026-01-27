import { z } from 'zod';

/**
 * Schema de validación para el formulario de attarctions
 * Usado tanto en creación como en edición
 */
export const attractionFormSchema = z.object({
	id: z.string(),
	name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
	slug: z.string().min(2, 'El slug debe tener al menos 2 caracteres').max(100),
	status: z.enum(['ACTIVE', 'DRAFT', 'INACTIVE'], {
		errorMap: () => ({ message: 'Debe seleccionar un tipo válido' })
	}),
	description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(500),
	descriptionLong: z
		.string()
		.min(10, 'La descripción larga debe tener al menos 10 caracteres')
		.max(512),
	photoUrl: z.string().url('Debe ser una URL válida')
});

export type AttractionFormSchema = z.infer<typeof attractionFormSchema>;
