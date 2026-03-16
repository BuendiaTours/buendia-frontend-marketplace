import { z } from 'zod/v3';
import {
	ActivityDateMode,
	ActivityGuideKind,
	ActivityKind,
	ActivityPetsAllowed,
	ActivityStatus,
	ActivityTransportKind,
	ActivityTransportLocation
} from '$core/activities/enums';

export const activityFormSchema = z.object({
	id: z.string(),
	title: z.string().min(3).max(200),
	slug: z.string().min(3).max(200),
	supplierId: z.string().min(1),
	codeRef: z.string().max(100).default(''),
	status: z.nativeEnum(ActivityStatus),
	kind: z.nativeEnum(ActivityKind),
	dateMode: z.nativeEnum(ActivityDateMode),
	guideKind: z.nativeEnum(ActivityGuideKind),
	descriptionShort: z.string().min(3),
	descriptionFull: z.string().min(3),
	infoImportant: z.string().default(''),
	phoneContact: z.string().default(''),
	transportKind: z.nativeEnum(ActivityTransportKind).default(ActivityTransportKind.NONE),
	transportLocation: z
		.nativeEnum(ActivityTransportLocation)
		.default(ActivityTransportLocation.SAME_PLACE),
	petsAllowed: z.nativeEnum(ActivityPetsAllowed).default(ActivityPetsAllowed.NOT_APPLY),
	petsAllowedDescription: z.string().default(''),
	voucherInfo: z.string().default(''),
	restrictions: z.array(z.object({ id: z.string(), name: z.string() })).default([]),
	notSuitableFor: z.array(z.object({ id: z.string(), name: z.string() })).default([]),
	included: z.array(z.string()).default([]),
	excluded: z.array(z.string()).default([]),
	itemsToBring: z.array(z.string()).default([]),
	willDoing: z.array(z.string()).default([])
});

export type ActivityFormSchema = z.infer<typeof activityFormSchema>;
