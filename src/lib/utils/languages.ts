import * as m from '$paraglide/messages';

const msgs = m as unknown as Record<string, () => string>;

function resolveLanguageName(code: string): string {
	return msgs[`enum_language_${code}`]?.() ?? code.toLowerCase();
}

export function formatGuideHighlight(guideKind: string | undefined, codes: string[]): string {
	if (!codes.length) return '';
	const kind = msgs[`enum_activityGuideKind_${guideKind ?? ''}`]?.() ?? 'Guía';
	const languages = codes.map(resolveLanguageName).join(', ');
	return m.activities_pdp_highlight_guide({ kind, languages });
}

export function formatAudioHighlight(codes: string[]): string {
	if (!codes.length) return '';
	const languages = codes.map(resolveLanguageName).join(', ');
	return m.activities_pdp_highlight_audio({ languages });
}
