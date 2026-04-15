export function formatSlotTime(isoDateTime: string): string {
	return new Date(isoDateTime).toISOString().slice(11, 16);
}

export function bookingToISODateTime(date: string, startTime: string): string {
	return `${date}T${startTime}:00Z`;
}
