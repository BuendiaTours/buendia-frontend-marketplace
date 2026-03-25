import { z } from 'zod/v3';
import { DestinationKind } from '$core/destinations/enums';

/**
 * Schema de validación para el formulario de destinations
 * Usado tanto en creación como en edición
 */
export const destinationFormSchema = z.object({
	id: z.string(),
	name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
	slug: z.string().min(2, 'El slug debe tener al menos 2 caracteres').max(100),
	kind: z.nativeEnum(DestinationKind, {
		errorMap: () => ({ message: 'Debe seleccionar un tipo válido' })
	}),
	descriptionShort: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(500),
	photoId: z.string().optional()
});

export type DestinationFormSchema = z.infer<typeof destinationFormSchema>;
