/**
 * Server load and action for the supplier creation page.
 * Uses generic factories — breadcrumbs and entity name are handled by the page component.
 */
import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import { createCreateAction } from '$lib/server/backoffice/createAction';
import { supplierFormSchema, type SupplierFormSchema } from '../schemas/supplier-form.schema';
import { SUPPLIER_REQUEST } from '$core/suppliers/requests';
import { zod } from 'sveltekit-superforms/adapters';
import { CommissionKind, SupplierStatus } from '$core/suppliers/enums';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = createCreateLoad<SupplierFormSchema>({
	schema: zod(supplierFormSchema),
	initialValues: {
		name: '',
		slug: '',
		commissionKind: CommissionKind.PERCENTAGE,
		commissionValue: 0,
		companyName: '',
		vat: '',
		ownerFirstName: '',
		ownerLastName: '',
		email: '',
		phone: '',
		postalAddress: '',
		logoUrl: '',
		aboutUs: ''
	}
});

export const actions: Actions = {
	default: createCreateAction({
		basePath: `${BACKOFFICE_PREFIX}/suppliers`,
		schema: zod(supplierFormSchema),
		createFn: SUPPLIER_REQUEST.create,
		redirectToList: true,
		transformData: ({ commissionValue, ...rest }) => ({
			...rest,
			status: SupplierStatus.DRAFT,
			commissionValue: Math.round(commissionValue * 100)
		})
	})
};
