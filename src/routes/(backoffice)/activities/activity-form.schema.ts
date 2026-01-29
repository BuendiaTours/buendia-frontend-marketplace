import { z } from 'zod';

/**
 * Schema de validación para el formulario de actividades
 * Usado tanto en creación como en edición
 */
export const activityFormSchema = z.object({
	id: z.string(),
	title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200),
	slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres').max(100),
	codeRef: z.string(),
	currency: z.enum(['EUR', 'USD', 'GBP']),
	descriptionFull: z.string().min(3, 'El campo debe tener al menos 3 caracteres'),
	descriptionShort: z.string().min(3, 'El campo debe tener al menos 3 caracteres'),
	infoImportant: z.string(),
	isFreeTour: z.boolean(),
	phoneContact: z.string().optional(),
	location: z.string().min(2, 'La ubicación debe tener al menos 2 caracteres'),
	priceFrom: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
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
		.default([]),
	attractions: z
		.array(
			z.object({
				id: z.string(),
				name: z.string()
			})
		)
		.default([]),
	destinations: z
		.array(
			z.object({
				id: z.string(),
				name: z.string()
			})
		)
		.default([]),
	distributives: z
		.array(
			z.object({
				id: z.string(),
				name: z.string()
			})
		)
		.default([]),
	excluded: z.array(z.string()).default([]),
	included: z.array(z.string()).default([]),
	itemsToBring: z.array(z.string()).default([]),
	status: z.enum(
		['APPROVED', 'DELETED', 'DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'UNPUBLISHED'],
		{
			errorMap: () => ({ message: 'Debe seleccionar un tipo válido' })
		}
	)
});

export type ActivityFormSchema = z.infer<typeof activityFormSchema>;
