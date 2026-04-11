import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import {
	contentBlockFormSchema,
	type ContentBlockFormSchema
} from '../schemas/content-block-form.schema';
import { CONTENT_BLOCK_REQUEST } from '$core/content-blocks/requests';
import { zod } from 'sveltekit-superforms/adapters';
import { ContentBlockKind } from '$core/content-blocks/enums';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { redirect, fail, isRedirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { setFlashMessage } from '$lib/server/backoffice/flashMessages';
import { ApiError } from '$core/_shared/errors';
import { logger } from '$lib/utils/logger';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url, ...rest }) => {
	const activityId = url.searchParams.get('activityId') || undefined;

	const loader = createCreateLoad<ContentBlockFormSchema>({
		schema: zod(contentBlockFormSchema),
		initialValues: {
			title: '',
			description: '',
			kind: ContentBlockKind.URL,
			target: '',
			mediaIds: [],
			...(activityId ? { activityId } : {})
		}
	});

	return loader({ url, ...rest } as Parameters<typeof loader>[0]);
};

export const actions: Actions = {
	default: async ({ request, fetch, cookies, url }) => {
		const form = await superValidate(request, zod(contentBlockFormSchema));

		if (!form.valid) {
			setFlashMessage(cookies, {
				type: 'error',
				message: 'Por favor, corrige los errores del formulario.',
				code: 'error.validation'
			});
			return fail(400, { form });
		}

		try {
			await CONTENT_BLOCK_REQUEST.create(fetch, form.data);
			logger.log('✅ Content block created:', form.data.id);

			await new Promise((resolve) => setTimeout(resolve, 2000));

			setFlashMessage(cookies, {
				type: 'success',
				message: 'Bloque de contenido creado correctamente.',
				code: 'create.success'
			});

			const returnTo = url.searchParams.get('returnTo');
			if (returnTo) {
				const returnUrl = new URL(returnTo, url.origin);
				returnUrl.searchParams.set('addContentBlockId', form.data.id);
				throw redirect(303, returnUrl.pathname + returnUrl.search);
			}

			throw redirect(303, `${BACKOFFICE_PREFIX}/content-blocks`);
		} catch (err) {
			if (isRedirect(err)) throw err;

			let errorMessage = 'Error al crear el bloque de contenido.';
			if (err instanceof ApiError) {
				errorMessage = `Error al crear (${err.status}).`;
			}

			setFlashMessage(cookies, {
				type: 'error',
				message: errorMessage,
				code: 'error.create'
			});

			return fail(err instanceof ApiError ? err.status || 500 : 503, { form });
		}
	}
};
