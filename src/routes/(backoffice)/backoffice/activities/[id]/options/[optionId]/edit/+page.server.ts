/**
 * Server load and actions for the activity option edit page.
 * Handles General + Configuration fields in a single form.
 */
import { ACTIVITY_OPTION_REQUEST } from '$core/activity-options/requests';
import { OptionDurationUnit, OptionStatus } from '$core/activity-options/enums';
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
	},
	changeStatus: async ({ fetch, params, request, cookies }) => {
		const formData = await request.formData();
		const newStatus = formData.get('status') as string;
		const redirectUrl = `${BACKOFFICE_PREFIX}/activities/${params.id}/options/${params.optionId}/edit`;

		const allowed = [OptionStatus.PUBLISHED, OptionStatus.UNPUBLISHED];
		if (!allowed.includes(newStatus as OptionStatus)) {
			setFlashMessage(cookies, {
				type: 'error',
				message: 'Transición de estado no permitida.',
				code: 'status.error'
			});
			throw redirect(303, redirectUrl);
		}

		try {
			await ACTIVITY_OPTION_REQUEST.update(fetch, params.optionId, {
				status: newStatus as OptionStatus
			});
			setFlashMessage(cookies, {
				type: 'success',
				message:
					newStatus === OptionStatus.PUBLISHED
						? 'Opción publicada correctamente.'
						: 'Opción despublicada correctamente.',
				code: 'status.success'
			});
			await new Promise((resolve) => setTimeout(resolve, 500));
			throw redirect(303, redirectUrl);
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) throw err;
			const errorMessage =
				err instanceof ApiError
					? `Error al cambiar el estado (código ${err.status}).`
					: 'Error al cambiar el estado de la opción.';
			setFlashMessage(cookies, { type: 'error', message: errorMessage, code: 'status.error' });
			throw redirect(303, redirectUrl);
		}
	}
};
