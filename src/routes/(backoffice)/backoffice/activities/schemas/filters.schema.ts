import type { FiltersSchema } from '$lib/utils/filters';
import {
	createPageField,
	createPageSizeField,
	createOrderField,
	createSortField
} from '$lib/utils/filters';
import type { CriteriaSortOption } from '$core/_shared/enums';
import { ActivityStatus } from '$core/activities/enums';

export type ActivitiesFilters = {
	page: number;
	pageSize: number;
	sort?: 'title';
	order?: CriteriaSortOption;
	q?: string;
	status?: ActivityStatus;
};

export const activitiesFiltersSchema: FiltersSchema<ActivitiesFilters> = {
	fields: {
		page: createPageField(),
		pageSize: createPageSizeField(),
		sort: createSortField(['title'] as const),
		order: createOrderField(),
		q: {
			parse: (raw) => raw || undefined,
			serialize: (value, out) => {
				if (value) {
					out.set('q', value);
				} else {
					out.delete('q');
				}
			},
			resetPageOnChange: true
		},
		status: {
			parse: (raw) => {
				if (Object.values(ActivityStatus).includes(raw as ActivityStatus)) {
					return raw as ActivityStatus;
				}
				return undefined;
			},
			serialize: (value, out) => {
				if (value) {
					out.set('status', value);
				} else {
					out.delete('status');
				}
			},
			resetPageOnChange: true
		}
	}
};
