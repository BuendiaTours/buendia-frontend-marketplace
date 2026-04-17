import { z } from 'zod/v3';

export const freeTourFormSchema = z.object({
	id: z.string(),
	title: z.string().min(2).max(200),
	slug: z.string().min(2).max(200),
	descriptionShort: z.string().max(500).default(''),
	descriptionFull: z.string().min(2),
	categories: z.array(z.object({ id: z.string(), name: z.string() })).default([]),
	destinations: z.array(z.object({ id: z.string(), name: z.string() })).default([]),
	included: z.array(z.object({ id: z.string(), name: z.string() })).default([]),
	excluded: z.array(z.object({ id: z.string(), name: z.string() })).default([]),
	willDoing: z.array(z.string()).default([]),
	restrictions: z.array(z.object({ id: z.string(), name: z.string() })).default([]),
	phoneContact: z.string().default(''),
	voucherInfo: z.string().default(''),
	supplierTip: z.string().default('')
});

export type FreeTourFormSchema = z.infer<typeof freeTourFormSchema>;
