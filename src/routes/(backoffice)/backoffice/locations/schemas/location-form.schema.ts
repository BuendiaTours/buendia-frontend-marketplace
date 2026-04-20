/**
 * Zod schema for the location create/edit form.
 * Source of truth for client-side validation — server re-validates via Superforms.
 */
import { z } from 'zod/v3';
import { LocationKind } from '$core/locations/enums';

export const locationFormSchema = z.object({
	id: z.string(),
	parentId: z.string().optional(),
	name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
	kind: z.nativeEnum(LocationKind, {
		errorMap: () => ({ message: 'Debe seleccionar un tipo válido' })
	}),
	descriptionLong: z.string().optional().default(''),
	location: z
		.object({
			type: z.literal('Point'),
			coordinates: z.tuple([z.number(), z.number()])
		})
		.nullable()
		.default(null)
});

export type LocationFormSchema = z.infer<typeof locationFormSchema>;
