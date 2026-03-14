import { CategoryStatus } from '$core/categories/enums';
import * as m from '$paraglide/messages';

export const CATEGORY_STATUS_OPTIONS = [
	{ id: CategoryStatus.ACTIVE, name: m.enum_categoryStatus_active() },
	{ id: CategoryStatus.DRAFT, name: m.enum_categoryStatus_draft() },
	{ id: CategoryStatus.INACTIVE, name: m.enum_categoryStatus_inactive() }
];
