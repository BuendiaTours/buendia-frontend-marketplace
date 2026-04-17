import type { CartBooking } from '$lib/types';

class RemovedBookingsState {
	bookings: CartBooking[] = $state([]);

	has(bookingId: string): boolean {
		return this.bookings.some((b) => b.id === bookingId);
	}

	add(booking: CartBooking): void {
		this.bookings = [...this.bookings, booking];
	}

	restore(bookingId: string): void {
		this.bookings = this.bookings.filter((b) => b.id !== bookingId);
	}

	clear(): void {
		this.bookings = [];
	}
}

export const removedBookingsStore = new RemovedBookingsState();
