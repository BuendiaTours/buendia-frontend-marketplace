/**
 * Client-side query to check slug availability via the API.
 * GET /slugs/:slug/exists returns true/false (may arrive as string or boolean).
 * Returns true if the slug is available (does not exist).
 */
import { get } from '$core/_shared/helpers';

export async function checkSlugAvailability(slug: string): Promise<boolean> {
	try {
		const result = await get<boolean | string>(fetch, `/slugs/${slug}/exists`);
		const exists = result === true || result === 'true';
		return !exists;
	} catch {
		return false;
	}
}
