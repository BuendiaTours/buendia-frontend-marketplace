import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatActivityDate(isoDateTime: string): string {
	return format(new Date(isoDateTime), "EEEE, d 'de' MMMM 'del' yyyy", { locale: es });
}

export function formatSlotTime(isoDateTime: string): string {
	return new Date(isoDateTime).toISOString().slice(11, 16);
}

export function bookingToISODateTime(date: string, startTime: string): string {
	return `${date}T${startTime}:00Z`;
}
