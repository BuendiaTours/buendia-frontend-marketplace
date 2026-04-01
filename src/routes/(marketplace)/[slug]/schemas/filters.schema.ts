import type { FiltersSchema } from '$lib/utils/filters';
import {
	createBooleanField,
	createOrderField,
	createPageField,
	createPageSizeField,
	createSortField
} from '$lib/utils/filters';
import { CriteriaSortOption } from '$core/_shared/enums';

export type DestinationActivitiesFilters = {
	page: number;
	pageSize: number;
	kind: string | undefined;
	sort?: 'rating' | 'price';
	order?: CriteriaSortOption;
	isFreeTour?: boolean;
	kidsFreeTour?: boolean;
	wheelchairAccessible?: boolean;
	breakfastIncluded?: boolean;
	audioGuideAvailable?: boolean;
	photographyAllowed?: boolean;
	smallGroup?: boolean;
};

export const DESTINATION_ACTIVITIES_SORT_OPTIONS = [
	{ value: '', label: 'Más relevantes', sort: null, order: null },
	{ value: 'rating:DESC', label: 'Valoraciones', sort: 'rating', order: CriteriaSortOption.DESC },
	{ value: 'price:ASC', label: 'Precio ascendente', sort: 'price', order: CriteriaSortOption.ASC },
	{
		value: 'price:DESC',
		label: 'Precio descendente',
		sort: 'price',
		order: CriteriaSortOption.DESC
	}
] as const;

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
		},
		sort: createSortField(['rating', 'price'] as const),
		order: createOrderField(),
		isFreeTour: createBooleanField('isFreeTour'),
		kidsFreeTour: createBooleanField('kidsFreeTour'),
		wheelchairAccessible: createBooleanField('wheelchairAccessible'),
		breakfastIncluded: createBooleanField('breakfastIncluded'),
		audioGuideAvailable: createBooleanField('audioGuideAvailable'),
		photographyAllowed: createBooleanField('photographyAllowed'),
		smallGroup: createBooleanField('smallGroup')
	}
};
