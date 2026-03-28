import { z } from 'zod/v3';

/** Form schema for editing media metadata (title + altText). */
export const mediaFormSchema = z.object({
	id: z.string(),
	title: z.string().min(2).max(200),
	altText: z.string().min(2).max(300)
});

export type MediaFormSchema = z.infer<typeof mediaFormSchema>;
