/**
 * Zod schema for the pickup point create/edit form.
 * Source of truth for client-side validation — server re-validates via Superforms.
 */
import { z } from 'zod/v3';

export const pickupPointFormSchema = z.object({
	id: z.string(),
	name: z.string().min(2).max(150),
	address: z.string().max(300).optional().default(''),
	city: z.string().max(100).optional().default(''),
	postCode: z.string().max(20).optional().default(''),
	countryCode: z.string().max(5).optional().default(''),
	location: z
		.object({
			type: z.literal('Point'),
			coordinates: z.tuple([z.number(), z.number()])
		})
		.nullable()
		.default(null)
});

export type PickupPointFormSchema = z.infer<typeof pickupPointFormSchema>;
