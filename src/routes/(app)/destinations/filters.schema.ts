import { z } from 'zod';

/**
 * Schema de validación para los filtros de destinations
 */
export const destinationsFiltersSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().default(10),
	q: z.string().optional(),
	// Ordenamiento
	sort: z.string().optional(),
	order: z.enum(['asc', 'desc']).optional(),
	// Filtros avanzados
	kind: z.enum(['CITY', 'REGION', 'COUNTRY']).optional(),
	wheelchairAccessible: z.coerce.boolean().optional(),
	breakfastIncluded: z.coerce.boolean().optional(),
	kidsFreeTour: z.coerce.boolean().optional()
});

export type DestinationsFilters = z.infer<typeof destinationsFiltersSchema>;
