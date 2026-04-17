/**
 * Server load and action for the activity option creation page.
 * After creation, redirects to the option edit page.
 */
import * as m from '$paraglide/messages';
import { v4 as uuidv4 } from 'uuid';
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { ACTIVITY_OPTION_REQUEST } from '$core/activity-options/requests';
import {
	OptionBookingSystem,
	OptionDurationUnit,
	OptionLanguage,
	OptionPrivacy,
	OptionStatus,
	OptionWheelchair
} from '$core/activity-options/enums';
import { ActivityKind } from '$core/activities/enums';
import { ApiError } from '$core/_shared/errors';
import { activityOptionCreateSchema } from './schemas/activity-option-create.schema';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { setFlashMessage } from '$lib/server/backoffice/flashMessages';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ parent, cookies, params }) => {
	const { activity, options } = await parent();

	// FREE_TOUR activities are restricted to a single option. If one already
	// exists, redirect back to the options list with an informative flash.
	if (activity.kind === ActivityKind.FREE_TOUR) {
		const activeOptions = (options ?? []).filter(
			(o: { status: OptionStatus }) => o.status !== OptionStatus.DELETED
		);
		if (activeOptions.length > 0) {
			setFlashMessage(cookies, {
				type: 'warning',
				message: m.activities_optionsFreeTourLimitReached(),
				code: 'options.free_tour_limit'
			});
			throw redirect(303, `${BACKOFFICE_PREFIX}/activities/${params.id}/options`);
		}
	}

	const form = await superValidate(
		{
			id: uuidv4(),
			activityId: activity.id,
			title: '',
			description: '',
			language: OptionLanguage.ES,
			bookingSystem: OptionBookingSystem.BOKUN,
			privacy: OptionPrivacy.PUBLIC,
			durationQuantity: 1,
			durationUnit: OptionDurationUnit.HOURS,
			wheelchair: OptionWheelchair.NOT_ACCESSIBLE
		},
		zod(activityOptionCreateSchema),
		{ errors: false }
	);

	return { activity, form };
};

export const actions: Actions = {
	default: async ({ fetch, request, params }) => {
		const form = await superValidate(request, zod(activityOptionCreateSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const {
			id,
			activityId,
			durationQuantity,
			durationUnit,
			description,
			skipTheLineType,
			maxGroupSize,
			maxTicketsPerIndividual,
			...rest
		} = form.data;

		try {
			await ACTIVITY_OPTION_REQUEST.create(fetch, {
				id,
				activityId,
				...rest,
				duration: { quantity: durationQuantity, unit: durationUnit },
				...(description ? { description } : {}),
				...(skipTheLineType ? { skipTheLineType } : {}),
				...(maxGroupSize ? { maxGroupSize } : {}),
				...(maxTicketsPerIndividual ? { maxTicketsPerIndividual } : {})
			});

			await new Promise((resolve) => setTimeout(resolve, 500));
			throw redirect(303, `${BACKOFFICE_PREFIX}/activities/${params.id}/options/${id}/edit`);
		} catch (err) {
			if (isRedirect(err)) throw err;

			if (err instanceof ApiError) {
				return fail(err.status || 500, { form });
			}
			return fail(503, { form });
		}
	}
};
