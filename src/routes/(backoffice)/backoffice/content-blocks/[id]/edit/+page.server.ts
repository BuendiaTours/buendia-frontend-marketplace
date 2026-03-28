import { CONTENT_BLOCK_REQUEST } from '$core/content-blocks/requests';
import { ApiError } from '$core/_shared/errors';
import { contentBlockFormSchema } from '../../schemas/content-block-form.schema';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
import { createDeleteAction } from '$lib/server/backoffice/deleteAction';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const contentBlock = await CONTENT_BLOCK_REQUEST.findById(fetch, params.id);

		const form = await superValidate(
			{
				id: contentBlock.id,
				title: contentBlock.title ?? '',
				description: contentBlock.description ?? '',
				kind: contentBlock.kind,
				target: contentBlock.target ?? '',
				mediaIds: (contentBlock.images ?? []).map((img) => img.mediaId)
			},
			zod(contentBlockFormSchema)
		);

		return { contentBlock, form };
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};

export const actions: Actions = {
	update: createUpdateAction({
		basePath: `${BACKOFFICE_PREFIX}/content-blocks`,
		schema: zod(contentBlockFormSchema),
		updateFn: CONTENT_BLOCK_REQUEST.update,
		redirectToList: true,
		redirectDelayMs: 2000,
		paramName: 'id',
		transformData: ({ id, ...rest }) => rest
	}),
	delete: createDeleteAction({
		basePath: `${BACKOFFICE_PREFIX}/content-blocks`,
		deleteFn: CONTENT_BLOCK_REQUEST.delete
	})
};
