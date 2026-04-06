import { pushEvent } from '../gtm';
import type { EventName } from '../types';

export function trackClick(
	eventName: EventName,
	cName: string,
	cLocation: string,
	cDestination?: string
): void {
	pushEvent({
		event: 'event_generic',
		event_name: eventName,
		click: { c_name: cName, c_location: cLocation, c_destination: cDestination }
	});
}
