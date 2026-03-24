/**
 * Server load and actions for the activity option edit page.
 * Handles General + Configuration fields in a single form.
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
			status: option.status,
			durationQuantity: option.duration?.quantity ?? 1,
			durationUnit: option.duration?.unit ?? OptionDurationUnit.HOURS,
			privacy: option.privacy,
			wheelchair: option.wheelchair,
			skipTheLineType: option.skipTheLineType ?? undefined,
			maxGroupSize: option.maxGroupSize ?? undefined,
			maxTicketsPerIndividual: option.maxTicketsPerIndividual ?? undefined,
			cutOff: option.cutOff ?? undefined
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
			description,
			skipTheLineType,
			maxGroupSize,
			maxTicketsPerIndividual,
			cutOff,
			...rest
		} = form.data;

		await ACTIVITY_OPTION_REQUEST.update(fetch, params.optionId, {
			...rest,
			duration: { quantity: durationQuantity, unit: durationUnit },
			description: description || undefined,
			skipTheLineType: skipTheLineType ?? undefined,
			maxGroupSize: maxGroupSize ?? undefined,
			maxTicketsPerIndividual: maxTicketsPerIndividual ?? undefined,
			cutOff: cutOff ?? undefined
		});

		return { form };
	}
};
