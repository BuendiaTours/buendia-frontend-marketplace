import { z } from 'zod/v3';

export const distributiveFormSchema = z.object({
	id: z.string(),
	name: z.string().min(2).max(100),
	slug: z.string().min(2).max(100),
	featuredScore: z.coerce.number().int().nonnegative().optional().default(0)
});

export type DistributiveFormSchema = z.infer<typeof distributiveFormSchema>;
