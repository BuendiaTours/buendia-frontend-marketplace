/**
 * Server load for the activity Classification tab.
 * Fetches available categories, available tags, and existing tag relationships.
 */
import { CATEGORY_REQUEST } from '$core/categories/requests';
import { TAG_REQUEST, TAG_RELATIONSHIP_REQUEST } from '$core/tags/requests';
import { TagRelationshipKind } from '$core/tags/enums';
import { CategoryStatus } from '$core/categories/enums';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, parent }) => {
	const { activity } = await parent();

	const [categoriesResponse, tagsResponse, tagRelationshipsResponse] = await Promise.all([
		CATEGORY_REQUEST.findByCriteria(fetch, {
			status: CategoryStatus.ACTIVE,
			limit: 200
		}),
		TAG_REQUEST.findByCriteria(fetch, { pageSize: 200 }),
		TAG_RELATIONSHIP_REQUEST.findByCriteria(fetch, {
			entityId: activity.id,
			kind: TagRelationshipKind.ACTIVITY,
			limit: 200
		})
	]);

	const availableCategories = categoriesResponse.data.map((c) => ({ id: c.id, name: c.name }));
	const availableTags = tagsResponse.data.map((t) => ({ id: t.id, name: t.name }));

	const tagMap = new Map(availableTags.map((t) => [t.id, t.name]));
	const activityTags = (tagRelationshipsResponse.data ?? []).map((rel) => ({
		relationshipId: rel.id,
		tagId: rel.tagId,
		name: tagMap.get(rel.tagId) ?? rel.tagId
	}));

	return { activity, availableCategories, availableTags, activityTags };
};
