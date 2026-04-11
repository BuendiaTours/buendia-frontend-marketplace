import { z } from 'zod/v3';

export const faqFormSchema = z.object({
	id: z.string(),
	activityId: z.string().optional(),
	question: z.string().min(3).max(500),
	answer: z.string().min(3)
});

export type FaqFormSchema = z.infer<typeof faqFormSchema>;
