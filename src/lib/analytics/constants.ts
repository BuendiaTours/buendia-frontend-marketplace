import type { EventName } from './types';

export const EVENT_NAMES = {
	PDP_CLICK: 'pdp_click',
	CTA_EXIT: 'cta_exit',
	OPEN_CHAT: 'open_chat',
	CTC_CLICK: 'ctc_click'
} as const satisfies Record<string, EventName>;

export type GalleryLocation = 'provider gallery' | 'user gallery';
