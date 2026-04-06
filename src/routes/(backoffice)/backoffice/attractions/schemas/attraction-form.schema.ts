import { z } from 'zod/v3';

export const attractionFormSchema = z.object({
	id: z.string(),
	name: z.string().min(2).max(100),
	description: z.string().min(10).max(500),
	descriptionLong: z.string().min(10).max(50000),
	postalAddress: z.string(),
	destinations: z
		.array(
			z.object({
				id: z.string(),
				name: z.string()
			})
		)
		.default([]),
	location: z
		.object({
			type: z.literal('Point'),
			coordinates: z.tuple([z.number(), z.number()])
		})
		.nullable()
		.default(null)
});

export type AttractionFormSchema = z.infer<typeof attractionFormSchema>;
