import { z } from 'zod/v3';
import { LocationKind } from '$core/locations/enums';

export const locationFormSchema = z.object({
	id: z.string(),
	parentId: z.string().optional(),
	name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
	kind: z.nativeEnum(LocationKind, {
		errorMap: () => ({ message: 'Debe seleccionar un tipo válido' })
	}),
	descriptionShort: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(500)
});

export type LocationFormSchema = z.infer<typeof locationFormSchema>;
