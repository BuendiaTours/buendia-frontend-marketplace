import * as m from '$paraglide/messages';
import type { CartPassenger } from '$lib/types';

const messages = m as unknown as Record<string, () => string>;

export function formatPassengerSummary(counts: Iterable<[string, number]>): string | null {
	const parts: string[] = [];
	for (const [group, count] of counts) {
		if (count === 0) continue;
		const label = messages[`enum_passengerKind_${group}_name`]?.() ?? group;
		parts.push(`${count} ${label}`);
	}
	return parts.length > 0 ? parts.join(', ') : null;
}

export function formatPassengersFromBooking(passengers: CartPassenger[]): string | null {
	const counts: Record<string, number> = {};
	for (const p of passengers) {
		if (!p.group) continue;
		counts[p.group] = (counts[p.group] ?? 0) + 1;
	}
	return formatPassengerSummary(Object.entries(counts));
}
