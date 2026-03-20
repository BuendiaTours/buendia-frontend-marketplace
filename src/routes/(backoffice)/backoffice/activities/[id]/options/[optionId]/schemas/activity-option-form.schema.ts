/**
 * Zod schema for the activity option edit form.
 * Maps to ActivityOptionUpdateDto fields.
 */
import { z } from 'zod/v3';
import {
	OptionBookingSystem,
	OptionDurationUnit,
	OptionLanguage,
	OptionPrivacy,
	OptionStatus,
	OptionTicketKind,
	OptionWheelchair
} from '$core/activity-options/enums';

export const activityOptionFormSchema = z.object({
	id: z.string(),
	title: z.string().min(2).max(200),
	description: z.string().max(2000).optional().default(''),
	language: z.nativeEnum(OptionLanguage),
	bookingSystem: z.nativeEnum(OptionBookingSystem),
	privacy: z.nativeEnum(OptionPrivacy),
	status: z.nativeEnum(OptionStatus),
	durationQuantity: z.number().min(1).default(1),
	durationUnit: z.nativeEnum(OptionDurationUnit).default(OptionDurationUnit.HOURS),
	wheelchair: z.nativeEnum(OptionWheelchair).default(OptionWheelchair.NOT_ACCESSIBLE),
	ticketKind: z.nativeEnum(OptionTicketKind).optional(),
	maxGroupSize: z.number().optional(),
	maxTicketsPerIndividual: z.number().optional(),
	supplierOptionCode: z.string().max(100).optional().default('')
});

export type ActivityOptionFormSchema = z.infer<typeof activityOptionFormSchema>;
