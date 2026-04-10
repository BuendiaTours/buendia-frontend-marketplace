/**
 * Server load and actions for the activity option edit page.
 * Handles General + Configuration fields in a single form.
 */
import * as m from '$paraglide/messages';
import { ACTIVITY_OPTION_REQUEST } from '$core/activity-options/requests';
import { OptionDurationUnit } from '$core/activity-options/enums';
import { ApiError } from '$core/_shared/errors';
import { activityOptionFormSchema } from '../schemas/activity-option-form.schema';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { setFlashMessage } from '$lib/server/backoffice/flashMessages';
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
			durationQuantity: option.duration?.quantity ?? 1,
			durationUnit: option.duration?.unit ?? OptionDurationUnit.HOURS,
			privacy: option.privacy,
			wheelchair: option.wheelchair,
			skipTheLineType: option.skipTheLineType ?? undefined,
			maxGroupSize: option.maxGroupSize ?? undefined,
			maxTicketsPerIndividual: option.maxTicketsPerIndividual ?? undefined
		},
		zod(activityOptionFormSchema)
	);

	return { form };
};

function getOptionPublishErrorMessage(errorCode: string): string | undefined {
	const messages: Record<string, () => string> = {
		ACTIVITY_OPTION_NOT_PUBLISHABLE: m.activities_optionPublishErrorNotPublishable,
		ACTIVITY_OPTION_MISSING_TICKET: m.activities_optionPublishErrorMissingTickets,
		ACTIVITY_OPTION_MISSING_INTEGRATION: m.activities_optionPublishErrorMissingIntegration,
		ACTIVITY_OPTION_MISSING_PICKUP_PLACE: m.activities_optionPublishErrorMissingPickupPlace,
		ACTIVITY_OPTION_NOT_UNPUBLISHABLE: m.activities_optionPublishErrorNotUnpublishable
	};
	return messages[errorCode]?.();
}

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
			...rest
		} = form.data;

		await ACTIVITY_OPTION_REQUEST.update(fetch, params.optionId, {
			...rest,
			duration: { quantity: durationQuantity, unit: durationUnit },
			description: description || undefined,
			skipTheLineType: skipTheLineType ?? undefined,
			maxGroupSize: maxGroupSize ?? undefined,
			maxTicketsPerIndividual: maxTicketsPerIndividual ?? undefined
		});

		return { form };
	},
	changeStatus: async ({ fetch, params, request, cookies }) => {
		const formData = await request.formData();
		const action = formData.get('action') as string;
		const redirectUrl = `${BACKOFFICE_PREFIX}/activities/${params.id}/options/${params.optionId}/edit`;

		try {
			if (action === 'publish') {
				await ACTIVITY_OPTION_REQUEST.publish(fetch, params.optionId);
				setFlashMessage(cookies, {
					type: 'success',
					message: m.activities_optionPublishSuccess(),
					code: 'status.success'
				});
			} else {
				await ACTIVITY_OPTION_REQUEST.unpublish(fetch, params.optionId);
				setFlashMessage(cookies, {
					type: 'success',
					message: m.activities_optionUnpublishSuccess(),
					code: 'status.success'
				});
			}

			await new Promise((resolve) => setTimeout(resolve, 500));
			throw redirect(303, redirectUrl);
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) throw err;

			let errorMessage: string = m.activities_optionPublishErrorGeneric();

			if (
				err instanceof ApiError &&
				err.data &&
				typeof err.data === 'object' &&
				'errorCode' in err.data
			) {
				const code = (err.data as { errorCode: string }).errorCode;
				errorMessage = getOptionPublishErrorMessage(code) ?? errorMessage;
			}

			setFlashMessage(cookies, { type: 'error', message: errorMessage, code: 'status.error' });
			throw redirect(303, redirectUrl);
		}
	}
};
