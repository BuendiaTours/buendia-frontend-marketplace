import { z } from 'zod/v3';

export const tagFormSchema = z.object({
	id: z.string(),
	name: z.string().min(2).max(100)
});

export type TagFormSchema = z.infer<typeof tagFormSchema>;
