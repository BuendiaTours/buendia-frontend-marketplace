/**
 * Server load and action for the FAQ creation page.
 * Uses generic factories — breadcrumbs and entity name are handled by the page component.
 */
import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import { createCreateAction } from '$lib/server/backoffice/createAction';
import { faqFormSchema, type FaqFormSchema } from '../schemas/faq-form.schema';
import { FAQ_REQUEST } from '$core/faqs/requests';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url, ...rest }) => {
	const activityId = url.searchParams.get('activityId') || undefined;
	const distributiveId = url.searchParams.get('distributiveId') || undefined;

	const loader = createCreateLoad<FaqFormSchema>({
		schema: zod(faqFormSchema),
		initialValues: {
			question: '',
			answer: '',
			...(activityId ? { activityId } : {}),
			...(distributiveId ? { distributiveId } : {})
		}
	});

	return loader({ url, ...rest } as Parameters<typeof loader>[0]);
};

export const actions: Actions = {
	default: createCreateAction({
		basePath: `${BACKOFFICE_PREFIX}/faqs`,
		schema: zod(faqFormSchema),
		createFn: FAQ_REQUEST.create,
		redirectToList: true,
		returnToParam: 'addFaqId',
		transformData: ({ id, activityId, distributiveId, question, answer }) => ({
			id,
			question,
			answer,
			...(activityId ? { activityId } : {}),
			...(distributiveId ? { distributiveId } : {})
		})
	})
};
