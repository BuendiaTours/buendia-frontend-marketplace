import type { RequestHandler } from './$types';
import type { CartOrder } from '$lib/types';

function formatICalDate(isoString: string): string {
	return new Date(isoString)
		.toISOString()
		.replace(/[-:]/g, '')
		.replace(/\.\d{3}/, '');
}

function addHours(isoString: string, hours: number): string {
	const d = new Date(isoString);
	d.setTime(d.getTime() + hours * 60 * 60 * 1000);
	return d.toISOString();
}

function escapeText(text: string): string {
	return text
		.replace(/\\/g, '\\\\')
		.replace(/,/g, '\\,')
		.replace(/;/g, '\\;')
		.replace(/\n/g, '\\n');
}

export const GET: RequestHandler = async ({ params, fetch }) => {
	const res = await fetch(`/api/orders/${params.orderId}`);
	if (!res.ok) return new Response('Order not found', { status: 404 });

	const order: CartOrder = await res.json();
	const bookings = order.bookings ?? [];

	const dtstamp = formatICalDate(new Date().toISOString());

	const events = bookings
		.filter((b) => b.activityDatetime)
		.map((b) => {
			const dtstart = formatICalDate(b.activityDatetime ?? '');
			const dtend = formatICalDate(addHours(b.activityDatetime ?? '', 2));
			const summary = escapeText(b.activityTitle ?? 'Reserva Buendia Travel');
			const description = escapeText(
				[b.optionTitle, b.legibleId ? `Ref: ${b.legibleId}` : ''].filter(Boolean).join(' - ')
			);
			const pickupPoint = b.pickupPoint as Record<string, unknown> | null | undefined;
			const location = escapeText((pickupPoint?.address as string) ?? '');

			return [
				'BEGIN:VEVENT',
				`UID:${b.id}@buendia.travel`,
				`DTSTAMP:${dtstamp}`,
				`DTSTART:${dtstart}`,
				`DTEND:${dtend}`,
				`SUMMARY:${summary}`,
				description ? `DESCRIPTION:${description}` : '',
				location ? `LOCATION:${location}` : '',
				'END:VEVENT'
			]
				.filter(Boolean)
				.join('\r\n');
		});

	const ical = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Buendia Travel//Calendar//ES',
		'METHOD:PUBLISH',
		...events,
		'END:VCALENDAR'
	].join('\r\n');

	const filename = `reserva-${params.orderId}.ics`;

	return new Response(ical, {
		headers: {
			'Content-Type': 'text/calendar; charset=utf-8',
			'Content-Disposition': `attachment; filename="${filename}"`
		}
	});
};
