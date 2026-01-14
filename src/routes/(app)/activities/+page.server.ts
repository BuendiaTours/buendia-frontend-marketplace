import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PUBLIC_API_BASE_URL } from '$env/static/public';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const page = Number(url.searchParams.get('page') ?? '1');
	const pageSize = Number(url.searchParams.get('pageSize') ?? '10');

	const apiUrl = `${PUBLIC_API_BASE_URL}/public/activities?page=${page}&pageSize=${pageSize}`;
	const res = await fetch(apiUrl);

	if (!res.ok) {
		throw error(res.status, `Error al cargar actividades: ${res.status}`);
	}

	const data = await res.json();

	return {
		items: data.items,
		pagination: data.pagination
	};
};
