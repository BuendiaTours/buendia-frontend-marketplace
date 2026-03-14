import { z } from 'zod/v3';
import { AttractionStatus } from '$core/attractions/enums';

export const attractionFormSchema = z.object({
	id: z.string(),
	name: z.string().min(2).max(100),
	status: z.nativeEnum(AttractionStatus),
	description: z.string().min(10).max(500),
	descriptionLong: z.string().min(10).max(512),
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
