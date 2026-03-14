import { SupplierStatus } from '$core/suppliers/enums';
import * as m from '$paraglide/messages';

export const SUPPLIER_STATUS_OPTIONS = [
	{ id: SupplierStatus.ACTIVE, name: m.enum_supplierStatus_active() },
	{ id: SupplierStatus.DRAFT, name: m.enum_supplierStatus_draft() },
	{ id: SupplierStatus.INACTIVE, name: m.enum_supplierStatus_inactive() }
];
