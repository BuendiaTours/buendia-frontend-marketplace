/**
 * Server load and actions for the supplier edit page.
 * Fetches the supplier by ID, populates the form, and wires up update/delete actions.
 */
import { SUPPLIER_REQUEST } from '$core/suppliers/requests';
import { ApiError } from '$core/_shared/errors';
import { supplierFormSchema } from '../../schemas/supplier-form.schema';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
import { createDeleteAction } from '$lib/server/backoffice/deleteAction';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const supplier = await SUPPLIER_REQUEST.findById(fetch, params.id);

		const form = await superValidate(
			{
				id: supplier.id,
				name: supplier.name,
				slug: supplier.slug,
				status: supplier.status,
				companyName: supplier.companyName,
				vat: supplier.vat,
				ownerFirstName: supplier.ownerFullName.firstName,
				ownerLastName: supplier.ownerFullName.lastName,
				email: supplier.email,
				phone: supplier.phone ?? '',
				postalAddress: supplier.postalAddress ?? '',
				logoUrl: supplier.logoUrl ?? '',
				aboutUs: supplier.aboutUs ?? ''
			},
			zod(supplierFormSchema)
		);

		return { supplier, form };
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};

export const actions: Actions = {
	update: createUpdateAction({
		basePath: `${BACKOFFICE_PREFIX}/suppliers`,
		schema: zod(supplierFormSchema),
		updateFn: SUPPLIER_REQUEST.update,
		redirectToList: true,
		paramName: 'id',
		transformData: ({ id, ...rest }) => rest
	}),
	delete: createDeleteAction({
		basePath: `${BACKOFFICE_PREFIX}/suppliers`,
		deleteFn: SUPPLIER_REQUEST.delete
	})
};
