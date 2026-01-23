import { z } from 'zod';

/**
 * Schema de validación para el formulario de actividades
 * Usado tanto en creación como en edición
 */
export const activityFormSchema = z.object({
	codeRef: z.string(),
	currency: z.enum(['EUR', 'USD', 'GBP']),
	descriptionFull: z.string().min(3, 'El campo debe tener al menos 3 caracteres'),
	descriptionShort: z.string().min(3, 'El campo debe tener al menos 3 caracteres'),
	infoImportant: z.string(),
	id: z.string(),
	isFreeTour: z.boolean(),
	location: z.string().min(2, 'La ubicación debe tener al menos 2 caracteres'),
	priceFrom: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
	slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres').max(20),
	title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200),
	tags: z
		.array(
			z.object({
				id: z.string(),
				name: z.string()
			})
		)
		.default([]),
	categories: z
		.array(
			z.object({
				id: z.string(),
				name: z.string()
			})
		)
		.default([])
});

export type ActivityFormSchema = z.infer<typeof activityFormSchema>;
