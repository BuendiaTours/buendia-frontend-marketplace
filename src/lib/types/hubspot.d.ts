declare global {
	interface Window {
		hsConversationsSettings?: { loadImmediately?: boolean };
		hsConversationsOnReady?: (() => void)[];
		HubSpotConversations?: {
			widget: {
				open: () => void;
				close: () => void;
				status: () => { loaded: boolean; pending: boolean };
			};
		};
	}
}
