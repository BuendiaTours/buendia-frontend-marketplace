import { backoffice } from '../core';

export const CONTENT_BLOCK_ROUTES = {
	list: backoffice('content-blocks'),
	create: backoffice('content-blocks/create'),
	edit: (id: string) => backoffice('content-blocks', id, 'edit')
} as const;
