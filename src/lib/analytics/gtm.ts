import { browser, dev } from '$app/environment';
import type { GtmEvent } from './types';

export function pushEvent(event: GtmEvent): void {
	if (!browser) return;
	try {
		window.dataLayer = window.dataLayer || [];
		if (dev) console.warn('[GTM]', event);
		window.dataLayer.push({ event: undefined, event_name: undefined, click: undefined });
		window.dataLayer.push(event);
	} catch (e) {
		if (dev) console.error('[GTM] push failed', e);
	}
}
