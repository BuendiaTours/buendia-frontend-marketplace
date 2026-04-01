import { z } from 'zod/v3';
import { FaqStatus } from '$core/faqs/enums';

export const faqFormSchema = z.object({
	id: z.string(),
	question: z.string().min(3).max(500),
	answer: z.string().min(3),
	status: z.nativeEnum(FaqStatus)
});

export type FaqFormSchema = z.infer<typeof faqFormSchema>;
