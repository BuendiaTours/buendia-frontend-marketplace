import { z } from 'zod/v3';
import { CategoryStatus } from '$core/categories/enums';

export const categoryFormSchema = z.object({
	id: z.string(),
	name: z.string().min(2).max(100),
	status: z.nativeEnum(CategoryStatus),
	description: z.string().max(500).optional().default('')
});

export type CategoryFormSchema = z.infer<typeof categoryFormSchema>;
