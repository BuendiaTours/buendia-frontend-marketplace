import { z } from 'zod';

/**
 * Schema de validación para el formulario de actividades
 * Usado tanto en creación como en edición
 */
export const activityFormSchema = z.object({
	title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200),
	location: z.string().min(2, 'La ubicación debe tener al menos 2 caracteres'),
	priceFrom: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
	currency: z.enum(['EUR', 'USD', 'GBP']),
	isFreeTour: z.boolean()
});

export type ActivityFormSchema = z.infer<typeof activityFormSchema>;
