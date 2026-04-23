import { z } from 'zod/v3';
import { ContentBlockKind } from '$core/content-blocks/enums';

export const contentBlockFormSchema = z.object({
	id: z.string(),
	activityId: z.string().optional(),
	distributiveId: z.string().optional(),
	title: z.string().min(2).max(200),
	description: z.string().min(2).max(500),
	kind: z.nativeEnum(ContentBlockKind),
	target: z.string().min(1).max(500),
	mediaIds: z.array(z.string()).default([])
});

export type ContentBlockFormSchema = z.infer<typeof contentBlockFormSchema>;
