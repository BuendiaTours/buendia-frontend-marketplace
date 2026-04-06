/**
 * Server load and actions for the supplier edit page.
 * Fetches the supplier by ID, populates the form, and wires up update/delete actions.
 */
import { SUPPLIER_REQUEST } from '$core/suppliers/requests';
import { CommissionKind, SupplierStatus } from '$core/suppliers/enums';
import { ApiError } from '$core/_shared/errors';
import { supplierFormSchema } from '../../schemas/supplier-form.schema';
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
		const supplier = await SUPPLIER_REQUEST.findById(fetch, params.id);

		const form = await superValidate(
			{
				id: supplier.id,
				name: supplier.name,
				slug: supplier.slug,
				commissionKind: supplier.commissionKind ?? CommissionKind.PERCENTAGE,
				commissionValue: supplier.commissionValue ? supplier.commissionValue / 100 : 0,
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
		transformData: ({ id, commissionValue, commissionKind, ...rest }) => ({
			...rest,
			commissionKind: commissionValue > 0 ? commissionKind : null,
			commissionValue: commissionValue > 0 ? Math.round(commissionValue * 100) : null
		})
	}),
	delete: createDeleteAction({
		basePath: `${BACKOFFICE_PREFIX}/suppliers`,
		deleteFn: SUPPLIER_REQUEST.delete
	}),
	changeStatus: async ({ fetch, params, request, cookies }) => {
		const formData = await request.formData();
		const newStatus = formData.get('status') as string;

		const allowed = [SupplierStatus.ACTIVE, SupplierStatus.INACTIVE];
		if (!allowed.includes(newStatus as SupplierStatus)) {
			setFlashMessage(cookies, {
				type: 'error',
				message: 'Transición de estado no permitida.',
				code: 'status.error'
			});
			throw redirect(303, `${BACKOFFICE_PREFIX}/suppliers/${params.id}/edit`);
		}

		try {
			await SUPPLIER_REQUEST.update(fetch, params.id, {
				status: newStatus as SupplierStatus
			});
			setFlashMessage(cookies, {
				type: 'success',
				message:
					newStatus === SupplierStatus.ACTIVE
						? 'Proveedor activado correctamente.'
						: 'Proveedor desactivado correctamente.',
				code: 'status.success'
			});
			await new Promise((resolve) => setTimeout(resolve, 500));
			throw redirect(303, `${BACKOFFICE_PREFIX}/suppliers/${params.id}/edit`);
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) throw err;
			const errorMessage =
				err instanceof ApiError
					? `Error al cambiar el estado (código ${err.status}).`
					: 'Error al cambiar el estado del proveedor.';
			setFlashMessage(cookies, { type: 'error', message: errorMessage, code: 'status.error' });
			throw redirect(303, `${BACKOFFICE_PREFIX}/suppliers/${params.id}/edit`);
		}
	}
};
