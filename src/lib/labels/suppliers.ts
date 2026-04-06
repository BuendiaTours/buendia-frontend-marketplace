import { CommissionKind, SupplierStatus } from '$core/suppliers/enums';
import * as m from '$paraglide/messages';

export const SUPPLIER_STATUS_OPTIONS = [
	{ id: SupplierStatus.ACTIVE, name: m.enum_supplierStatus_active() },
	{ id: SupplierStatus.DRAFT, name: m.enum_supplierStatus_draft() },
	{ id: SupplierStatus.INACTIVE, name: m.enum_supplierStatus_inactive() }
];

export const COMMISSION_KIND_OPTIONS = [
	{ id: CommissionKind.FIXED, name: m.enum_commissionKind_fixed() },
	{ id: CommissionKind.PERCENTAGE, name: m.enum_commissionKind_percentage() }
];
