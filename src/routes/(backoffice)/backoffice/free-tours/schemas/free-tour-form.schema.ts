import { z } from 'zod/v3';

export const freeTourFormSchema = z.object({
	id: z.string(),
	title: z.string().min(2).max(200),
	slug: z.string().min(2).max(200),
	descriptionShort: z.string().min(2).max(500),
	descriptionFull: z.string().min(2),
	categories: z.array(z.object({ id: z.string(), name: z.string() })).default([]),
	destinations: z.array(z.object({ id: z.string(), name: z.string() })).default([])
});

export type FreeTourFormSchema = z.infer<typeof freeTourFormSchema>;
