import { ActivityKind } from '$core/activities/enums';

type ActivityTitleConfig = {
	displayName: string;
	masculine: boolean;
};

const ACTIVITY_TITLE_CONFIG: Record<ActivityKind, ActivityTitleConfig> = {
	[ActivityKind.FREE_TOUR]: { displayName: 'free tour', masculine: true },
	[ActivityKind.PAID_TOUR]: { displayName: 'tour', masculine: true }, // placeholder — TBD
	[ActivityKind.OTHER]: { displayName: 'actividad', masculine: false }
};

type ActivitySectionTitles = {
	itinerary: string;
	description: string;
	whatsIncluded: string;
	faqs: string;
};

export function getActivitySectionTitles(
	kind: ActivityKind,
	destinationName?: string
): ActivitySectionTitles {
	const config = ACTIVITY_TITLE_CONFIG[kind];
	const prep = config.masculine ? 'del' : 'de la';
	const pronoun = config.masculine ? 'este' : 'esta';
	const { displayName } = config;

	return {
		itinerary: `Itinerario ${prep} ${displayName}`,
		description: `Descripción ${prep} ${displayName}`,
		whatsIncluded: `Qué incluye ${pronoun} ${displayName}`,
		faqs: `Preguntas frecuentes sobre ${pronoun} ${displayName}${destinationName ? ` en ${destinationName}` : ''}`
	};
}
