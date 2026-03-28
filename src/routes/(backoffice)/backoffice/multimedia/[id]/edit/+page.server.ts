/**
 * Server load and actions for the media edit page.
 * Fetches the media by ID, populates the form, and wires up update/delete actions.
 */
import { MEDIA_REQUEST } from '$core/multimedia/requests';
import { ApiError } from '$core/_shared/errors';
import { mediaFormSchema } from '../../schemas/media-form.schema';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
import { createDeleteAction } from '$lib/server/backoffice/deleteAction';
import { PUBLIC_CDN_BASE_URL } from '$env/static/public';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const media = await MEDIA_REQUEST.findById(fetch, params.id);

		// Resolve originalUrl from S3 key to full CDN URL
		if (media.originalUrl && !media.originalUrl.startsWith('http')) {
			media.originalUrl = `${PUBLIC_CDN_BASE_URL}/${media.originalUrl}`;
		}
		const form = await superValidate(
			{
				id: media.id,
				title: media.title ?? '',
				altText: media.altText ?? ''
			},
			zod(mediaFormSchema)
		);

		return { media, form };
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};

export const actions: Actions = {
	update: createUpdateAction({
		basePath: `${BACKOFFICE_PREFIX}/multimedia`,
		schema: zod(mediaFormSchema),
		updateFn: MEDIA_REQUEST.update,
		redirectToList: true,
		paramName: 'id',
		transformData: ({ id, ...rest }) => rest
	}),
	delete: createDeleteAction({
		basePath: `${BACKOFFICE_PREFIX}/multimedia`,
		deleteFn: MEDIA_REQUEST.delete
	})
};
