/**
 * Zod schema for the activity option edit form.
 * Includes General + Configuration fields (everything except Booking System).
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

export const activityOptionFormSchema = z.object({
	id: z.string(),
	title: z.string().min(2).max(200),
	description: z.string().max(2000).optional().default(''),
	language: z.nativeEnum(OptionLanguage),
	bookingSystem: z.nativeEnum(OptionBookingSystem),
	durationQuantity: z.number().min(1).default(1),
	durationUnit: z.nativeEnum(OptionDurationUnit).default(OptionDurationUnit.HOURS),
	privacy: z.nativeEnum(OptionPrivacy),
	wheelchair: z.nativeEnum(OptionWheelchair).default(OptionWheelchair.NOT_ACCESSIBLE),
	skipTheLineType: z.nativeEnum(OptionSkipTheLineType).optional(),
	maxGroupSize: z.number().optional(),
	maxTicketsPerIndividual: z.number().optional()
});

export type ActivityOptionFormSchema = z.infer<typeof activityOptionFormSchema>;
