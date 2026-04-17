import { z } from 'zod/v3';
import {
	ActivityDateMode,
	ActivityGuideKind,
	ActivityKind,
	ActivityPetsAllowed,
	ActivityTransportKind,
	ActivityTransportLocation
} from '$core/activities/enums';

/** Schema for the activity edit form — maps to ActivityUpdateDto. */
export const activityEditSchema = z.object({
	id: z.string(),
	title: z.string().min(3).max(200),
	slug: z.string().min(3).max(200),
	supplierId: z.string().min(1),
	kind: z.nativeEnum(ActivityKind),
	dateMode: z.nativeEnum(ActivityDateMode),
	guideKind: z.nativeEnum(ActivityGuideKind),
	descriptionFull: z.string().min(3),
	difficult: z.number().min(1).max(5).default(2),
	infoImportant: z.string().default(''),
	phoneContact: z.string().default(''),
	transportKind: z.nativeEnum(ActivityTransportKind).default(ActivityTransportKind.NONE),
	transportLocation: z
		.nativeEnum(ActivityTransportLocation)
		.default(ActivityTransportLocation.NOT_APPLY),
	petsAllowed: z.nativeEnum(ActivityPetsAllowed).default(ActivityPetsAllowed.NOT_APPLY),
	petsAllowedDescription: z.string().default(''),
	supplierTip: z.string().default(''),
	voucherInfo: z.string().default(''),
	restrictions: z.array(z.object({ id: z.string(), name: z.string() })).default([]),
	notSuitableFor: z.array(z.object({ id: z.string(), name: z.string() })).default([]),
	included: z.array(z.object({ id: z.string(), name: z.string() })).default([]),
	excluded: z.array(z.object({ id: z.string(), name: z.string() })).default([]),
	itemsToBring: z.array(z.string()).default([]),
	willDoing: z.array(z.string()).default([])
});

export type ActivityEditSchema = z.infer<typeof activityEditSchema>;
