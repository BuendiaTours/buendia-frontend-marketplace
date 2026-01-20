import { z } from 'zod';

/**
 * Schema de validación para el formulario de actividades
 * Usado tanto en creación como en edición
 */
export const activityFormSchema = z.object({
	id: z.string(),
	codeRef: z.string(),
	title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200),
	slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres').max(200),
	descriptionShort: z.string().min(3, 'El campo debe tener al menos 3 caracteres'),
	descriptionFull: z.string().min(3, 'El campo debe tener al menos 3 caracteres'),
	location: z.string().min(2, 'La ubicación debe tener al menos 2 caracteres'),
	priceFrom: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
	currency: z.enum(['EUR', 'USD', 'GBP']),
	isFreeTour: z.boolean()
});

export type ActivityFormSchema = z.infer<typeof activityFormSchema>;
