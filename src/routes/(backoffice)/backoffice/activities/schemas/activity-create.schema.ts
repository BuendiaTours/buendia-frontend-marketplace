import { z } from 'zod/v3';
import { ActivityDateMode, ActivityGuideKind, ActivityKind } from '$core/activities/enums';

/** Schema for the activity creation form — maps to ActivityCreateDto. */
export const activityCreateSchema = z.object({
	id: z.string(),
	title: z.string().min(3).max(200),
	slug: z.string().min(3).max(200),
	supplierId: z.string().min(1),
	kind: z.nativeEnum(ActivityKind),
	guideKind: z.nativeEnum(ActivityGuideKind),
	descriptionShort: z.string().min(3),
	descriptionFull: z.string().min(3),
	codeRef: z.string().max(100).default(''),
	dateMode: z.nativeEnum(ActivityDateMode).default(ActivityDateMode.DATE_AND_TIME),
	infoImportant: z.string().default(''),
	phoneContact: z.string().default('')
});

export type ActivityCreateSchema = z.infer<typeof activityCreateSchema>;
