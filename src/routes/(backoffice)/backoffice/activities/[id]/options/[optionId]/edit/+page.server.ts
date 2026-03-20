/**
 * Server load and actions for the activity option edit page.
 */
import { ACTIVITY_OPTION_REQUEST } from '$core/activity-options/requests';
import { OptionDurationUnit } from '$core/activity-options/enums';
import { activityOptionFormSchema } from '../schemas/activity-option-form.schema';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { option } = await parent();

	const form = await superValidate(
		{
			id: option.id,
			title: option.title,
			description: option.description ?? '',
			language: option.language,
			bookingSystem: option.bookingSystem,
			privacy: option.privacy,
			status: option.status,
			durationQuantity: option.duration?.quantity ?? 1,
			durationUnit: option.duration?.unit ?? OptionDurationUnit.HOURS,
			wheelchair: option.wheelchair,
			ticketKind: option.ticketKind ?? undefined,
			maxGroupSize: option.maxGroupSize ?? undefined,
			maxTicketsPerIndividual: option.maxTicketsPerIndividual ?? undefined,
			supplierOptionCode: option.supplierOptionCode ?? ''
		},
		zod(activityOptionFormSchema)
	);

	return { form };
};

export const actions: Actions = {
	update: async ({ fetch, request, params }) => {
		const form = await superValidate(request, zod(activityOptionFormSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const {
			id,
			durationQuantity,
			durationUnit,
			supplierOptionCode,
			description,
			ticketKind,
			maxGroupSize,
			maxTicketsPerIndividual,
			...rest
		} = form.data;

		await ACTIVITY_OPTION_REQUEST.update(fetch, params.optionId, {
			...rest,
			duration: { quantity: durationQuantity, unit: durationUnit },
			description: description || undefined,
			supplierOptionCode: supplierOptionCode || undefined,
			ticketKind: ticketKind ?? undefined,
			maxGroupSize: maxGroupSize ?? undefined,
			maxTicketsPerIndividual: maxTicketsPerIndividual ?? undefined
		});

		return { form };
	}
};
