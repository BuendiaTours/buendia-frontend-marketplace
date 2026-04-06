import { pushEvent } from '../gtm';
import { trackClick } from './common';

export function trackOpenChat(): void {
	pushEvent({
		event: 'event_generic',
		event_name: 'open_chat'
	});
}

export function trackCallChat(phone: string): void {
	trackClick('ctc_click', 'call chat', 'pdp', phone);
}

export function trackCtaExit(url: string): void {
	trackClick('cta_exit', 'punto de encuentro', 'pdp', url);
}
