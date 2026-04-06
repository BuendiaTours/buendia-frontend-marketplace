export type EventName = 'pdp_click' | 'cta_exit' | 'open_chat' | 'ctc_click';

export type GtmClickData = {
	c_name: string;
	c_location: string;
	c_destination: string | undefined;
};

export type GtmEvent = {
	event: 'event_generic';
	event_name: EventName;
	click?: GtmClickData;
};
