import { z } from 'zod';

// Enums used
import { ATTRACTION_STATUS_OPTIONS } from '$lib/config/enums';

/**
 * Schema de validación para el formulario de attractions
 * Usado tanto en creación como en edición
 */
export const attractionFormSchema = z.object({
	id: z.string(),
	name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
	slug: z.string().min(2, 'El slug debe tener al menos 2 caracteres').max(100),
	status: z.enum(ATTRACTION_STATUS_OPTIONS.map((option) => option.id) as [string, ...string[]], {
		errorMap: () => ({ message: 'Debe seleccionar un tipo válido' })
	}),
	description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(500),
	descriptionLong: z
		.string()
		.min(10, 'La descripción larga debe tener al menos 10 caracteres')
		.max(512),
	photoUrl: z.string().url('Debe ser una URL válida'),
	photoUrlHero: z.string().url('Debe ser una URL válida'),
	destinations: z
		.array(
			z.object({
				id: z.string(),
				name: z.string()
			})
		)
		.default([]),
	location: z
		.object({
			type: z.literal('Point'),
			coordinates: z.tuple([z.number(), z.number()])
		})
		.nullable()
		.default(null),
	postalAddress: z.string()
});

export type AttractionFormSchema = z.infer<typeof attractionFormSchema>;
