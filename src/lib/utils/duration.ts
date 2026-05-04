import * as m from '$paraglide/messages';

type DurationValue = { unit: string; quantity: number };
const msgs = m as unknown as Record<string, (p: Record<string, unknown>) => string>;

function unitLabel(unit: string, quantity: number): string {
	return msgs[`enum_durationUnit_${unit}`]?.({ count: quantity }) ?? unit.toLowerCase();
}

export function formatDuration(durationMin?: DurationValue, durationMax?: DurationValue): string {
	const value = durationMin ?? durationMax;
	if (!value) return '';

	if (durationMin && durationMax && durationMin.quantity !== durationMax.quantity) {
		return m.activities_pdp_highlight_duration_range({
			min: durationMin.quantity,
			max: durationMax.quantity,
			unit: unitLabel(durationMax.unit, durationMax.quantity)
		});
	}

	return m.activities_pdp_highlight_duration_single({
		quantity: value.quantity,
		unit: unitLabel(value.unit, value.quantity)
	});
}
