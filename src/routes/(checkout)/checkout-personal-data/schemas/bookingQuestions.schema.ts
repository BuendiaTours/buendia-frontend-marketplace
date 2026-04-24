import { z } from 'zod';
import type { BookingQuestion, CartBooking, PassengerGroup } from '$lib/types';
import type { SvelteMap } from 'svelte/reactivity';

function fieldForQuestion(q: BookingQuestion): z.ZodTypeAny {
	const isRequired = q.required === 'REQUIRED';

	switch (q.dataType) {
		case 'CHECKBOX':
		case 'BOOLEAN':
		case 'CHECK_TERMS':
			return isRequired ? z.literal('true', { error: 'Debes marcar esta casilla' }) : z.string();

		case 'EMAIL':
			return isRequired
				? z.string().min(1, 'El email es obligatorio').email('Email no válido')
				: z.string().refine((v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
						message: 'Email no válido'
					});

		case 'INPUT_NUMBER':
		case 'AGE': {
			const min = q.minValue;
			const max = q.maxValue;
			return z.string().refine(
				(val) => {
					if (val === '') return !isRequired;
					const n = Number(val);
					if (isNaN(n)) return false;
					if (min !== null && n < min) return false;
					if (max !== null && n > max) return false;
					return true;
				},
				{
					message:
						min !== null && max !== null
							? `Debe ser un número entre ${min} y ${max}`
							: min !== null
								? `Debe ser un número mayor o igual a ${min}`
								: max !== null
									? `Debe ser un número menor o igual a ${max}`
									: isRequired
										? 'Introduce un número válido'
										: 'Valor fuera de rango'
				}
			);
		}

		case 'MULTI_OPTION': {
			const minCount = q.minValue ?? (isRequired ? 1 : 0);
			return z.string().refine(
				(val) => {
					try {
						const arr = JSON.parse(val);
						return Array.isArray(arr) && arr.length >= minCount;
					} catch {
						return minCount === 0;
					}
				},
				{
					message:
						minCount > 0
							? `Selecciona al menos ${minCount} opción${minCount > 1 ? 'es' : ''}`
							: 'Valor no válido'
				}
			);
		}

		case 'DATE':
		case 'BIRTHDAY':
		case 'PASSPORT_EXPIRED':
		case 'DATE_AND_TIME':
		case 'PHONE':
		case 'OPTION':
		case 'RADIO_BUTTON':
		case 'COUNTRY':
		case 'LANGUAGE':
		case 'GENDER':
		case 'PASSPORT':
		case 'INPUT_TEXT':
		case 'TEXT_AREA':
		default:
			return isRequired ? z.string().min(1, 'Este campo es obligatorio') : z.string();
	}
}

export function bookingKey(bookingId: string, questionId: string): string {
	return `booking_${bookingId}_q_${questionId}`;
}

export function passengerKey(passengerId: string, questionId: string): string {
	return `passenger_${passengerId}_q_${questionId}`;
}

export function buildBookingQuestionsSchema(
	bookings: CartBooking[],
	questionsByOption: SvelteMap<string, BookingQuestion[]>
): z.ZodObject<Record<string, z.ZodTypeAny>> {
	const shape: Record<string, z.ZodTypeAny> = {};

	for (const booking of bookings) {
		const questions = questionsByOption.get(booking.optionId) ?? [];
		for (const q of questions) {
			if (q.target === 'BOOKING') {
				shape[bookingKey(booking.id, q.id)] = fieldForQuestion(q);
			} else {
				for (const passenger of booking.passengers ?? []) {
					if (!q.groupAge?.includes(passenger.group as PassengerGroup)) continue;
					shape[passengerKey(passenger.id, q.id)] = fieldForQuestion(q);
				}
			}
		}
	}

	return z.object(shape);
}

export function buildFlatAnswersObject(
	bookings: CartBooking[],
	questionsByOption: SvelteMap<string, BookingQuestion[]>,
	bookingAnswers: SvelteMap<string, SvelteMap<string, string>>,
	passengerAnswers: SvelteMap<string, SvelteMap<string, string>>
): Record<string, string> {
	const data: Record<string, string> = {};

	for (const booking of bookings) {
		const questions = questionsByOption.get(booking.optionId) ?? [];
		for (const q of questions) {
			if (q.target === 'BOOKING') {
				data[bookingKey(booking.id, q.id)] = bookingAnswers.get(booking.id)?.get(q.id) ?? '';
			} else {
				for (const passenger of booking.passengers ?? []) {
					if (!q.groupAge?.includes(passenger.group as PassengerGroup)) continue;
					data[passengerKey(passenger.id, q.id)] =
						passengerAnswers.get(passenger.id)?.get(q.id) ?? '';
				}
			}
		}
	}

	return data;
}
