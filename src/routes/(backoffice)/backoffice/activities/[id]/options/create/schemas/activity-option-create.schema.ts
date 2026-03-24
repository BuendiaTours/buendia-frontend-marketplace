/**
 * Zod schema for the activity option creation form.
 * Only includes General + Config fields visible in the create form.
 * bookingSystem is required by the DTO but defaults server-side (BOKUN).
 */
import { z } from 'zod/v3';
import {
	OptionBookingSystem,
	OptionDurationUnit,
	OptionLanguage,
	OptionPrivacy,
	OptionSkipTheLineType,
	OptionWheelchair
} from '$core/activity-options/enums';

export const activityOptionCreateSchema = z.object({
	id: z.string(),
	activityId: z.string(),
	title: z.string().min(2).max(200),
	description: z.string().max(2000).optional().default(''),
	language: z.nativeEnum(OptionLanguage),
	bookingSystem: z.nativeEnum(OptionBookingSystem),
	privacy: z.nativeEnum(OptionPrivacy),
	durationQuantity: z.number().min(1).default(1),
	durationUnit: z.nativeEnum(OptionDurationUnit).default(OptionDurationUnit.HOURS),
	wheelchair: z.nativeEnum(OptionWheelchair).default(OptionWheelchair.NOT_ACCESSIBLE),
	skipTheLineType: z.nativeEnum(OptionSkipTheLineType).optional(),
	maxGroupSize: z.number().optional(),
	maxTicketsPerIndividual: z.number().optional()
});

export type ActivityOptionCreateSchema = z.infer<typeof activityOptionCreateSchema>;
