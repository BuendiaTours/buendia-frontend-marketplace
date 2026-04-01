/**
 * Server load and actions for the FAQ edit page.
 * Fetches the FAQ by ID, populates the form, and wires up update/delete actions.
 */
import { FAQ_REQUEST } from '$core/faqs/requests';
import { ApiError } from '$core/_shared/errors';
import { faqFormSchema } from '../../schemas/faq-form.schema';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
import { createDeleteAction } from '$lib/server/backoffice/deleteAction';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const faq = await FAQ_REQUEST.findById(fetch, params.id);

		const form = await superValidate(
			{
				id: faq.id,
				question: faq.question,
				answer: faq.answer,
				status: faq.status
			},
			zod(faqFormSchema)
		);

		return { faq, form };
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};

export const actions: Actions = {
	update: createUpdateAction({
		basePath: `${BACKOFFICE_PREFIX}/faqs`,
		schema: zod(faqFormSchema),
		updateFn: FAQ_REQUEST.update,
		redirectToList: true,
		paramName: 'id',
		transformData: ({ id, ...rest }) => rest
	}),
	delete: createDeleteAction({
		basePath: `${BACKOFFICE_PREFIX}/faqs`,
		deleteFn: FAQ_REQUEST.delete
	})
};
