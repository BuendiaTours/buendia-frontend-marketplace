import type { FiltersSchema } from '$lib/utils/filters';
import { createPageField, createPageSizeField } from '$lib/utils/filters';

export type DestinationActivitiesFilters = {
	page: number;
	pageSize: number;
	kind: string | undefined;
};

export const destinationActivitiesFiltersSchema: FiltersSchema<DestinationActivitiesFilters> = {
	fields: {
		page: createPageField(1),
		pageSize: createPageSizeField(12),
		kind: {
			parse: (raw) => raw || undefined,
			serialize: (value, out) => {
				if (value) out.set('kind', value);
				else out.delete('kind');
			},
			resetPageOnChange: true
		}
	}
};
