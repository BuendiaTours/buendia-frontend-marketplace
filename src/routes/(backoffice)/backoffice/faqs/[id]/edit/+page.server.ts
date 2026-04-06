/**
 * Server load and actions for the FAQ edit page.
 * Fetches the FAQ by ID, populates the form, and wires up update/delete/changeStatus actions.
 */
import { FAQ_REQUEST } from '$core/faqs/requests';
import { FaqStatus } from '$core/faqs/enums';
import { ApiError } from '$core/_shared/errors';
import { faqFormSchema } from '../../schemas/faq-form.schema';
import { error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
import { createDeleteAction } from '$lib/server/backoffice/deleteAction';
import { setFlashMessage } from '$lib/server/backoffice/flashMessages';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const faq = await FAQ_REQUEST.findById(fetch, params.id);

		const form = await superValidate(
			{
				id: faq.id,
				question: faq.question,
				answer: faq.answer
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
	}),
	changeStatus: async ({ fetch, params, request, cookies }) => {
		const formData = await request.formData();
		const newStatus = formData.get('status') as string;

		const allowed = [FaqStatus.PUBLISHED, FaqStatus.DRAFT];
		if (!allowed.includes(newStatus as FaqStatus)) {
			setFlashMessage(cookies, {
				type: 'error',
				message: 'Transición de estado no permitida.',
				code: 'status.error'
			});
			throw redirect(303, `${BACKOFFICE_PREFIX}/faqs/${params.id}/edit`);
		}

		try {
			await FAQ_REQUEST.update(fetch, params.id, { status: newStatus as FaqStatus });
			setFlashMessage(cookies, {
				type: 'success',
				message:
					newStatus === FaqStatus.PUBLISHED
						? 'FAQ publicada correctamente.'
						: 'FAQ despublicada correctamente.',
				code: 'status.success'
			});
			await new Promise((resolve) => setTimeout(resolve, 500));
			throw redirect(303, `${BACKOFFICE_PREFIX}/faqs/${params.id}/edit`);
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) throw err;
			const errorMessage =
				err instanceof ApiError
					? `Error al cambiar el estado (código ${err.status}).`
					: 'Error al cambiar el estado de la FAQ.';
			setFlashMessage(cookies, { type: 'error', message: errorMessage, code: 'status.error' });
			throw redirect(303, `${BACKOFFICE_PREFIX}/faqs/${params.id}/edit`);
		}
	}
};
