import { backoffice } from '../core';

export const ANALYTICS_ROUTES = {
	dashboard: backoffice('analytics')
} as const;
