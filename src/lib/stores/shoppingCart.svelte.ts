import { SvelteMap } from 'svelte/reactivity';
import { proxyApiRoutes } from '$lib/api/proxy-routes';
import type {
	ActivityOption,
	AvailabilitySlot,
	CartOrder,
	CreateOrderPayload,
	AddBookingPayload
} from '$lib/types';

const CART_ORDER_ID_KEY = 'cart_order_id';
const CART_USER_ID_KEY = 'cart_user_id';
const CART_CREATED_AT_KEY = 'cart_created_at';

class ShoppingCartState {
	orderId = $state<string | null>(null);
	userId = $state<string | null>(null);
	order = $state<CartOrder | null>(null);
	isLoading = $state(false);
	error = $state<string | null>(null);
	activitySlugs = new SvelteMap<string, string>();

	bookingCount = $derived(this.order?.bookings?.length ?? 0);
	totalAmount = $derived(this.order?.totalAmount ?? 0);

	constructor() {
		if (typeof window !== 'undefined') {
			this.orderId = localStorage.getItem(CART_ORDER_ID_KEY);
			const storedUserId = localStorage.getItem(CART_USER_ID_KEY);
			if (storedUserId) {
				this.userId = storedUserId;
			} else {
				const newUserId = crypto.randomUUID();
				localStorage.setItem(CART_USER_ID_KEY, newUserId);
				this.userId = newUserId;
			}
			if (this.orderId) {
				const createdAt = localStorage.getItem(CART_CREATED_AT_KEY);
				if (createdAt) {
					const elapsed = Date.now() - new Date(createdAt).getTime();
					if (elapsed > 20 * 60 * 1000) {
						localStorage.removeItem(CART_ORDER_ID_KEY);
						localStorage.removeItem(CART_CREATED_AT_KEY);
						this.orderId = null;
					}
				}
				if (this.orderId) this.loadOrder();
			}
		}
	}

	setUserId(id: string) {
		this.userId = id;
		if (typeof window !== 'undefined') {
			localStorage.setItem(CART_USER_ID_KEY, id);
		}
	}

	private setOrderId(id: string | null) {
		this.orderId = id;
		if (typeof window !== 'undefined') {
			if (id) {
				localStorage.setItem(CART_ORDER_ID_KEY, id);
				localStorage.setItem(CART_CREATED_AT_KEY, new Date().toISOString());
			} else {
				localStorage.removeItem(CART_ORDER_ID_KEY);
				localStorage.removeItem(CART_CREATED_AT_KEY);
			}
		}
	}

	private buildPassengers(
		option: ActivityOption,
		counts: SvelteMap<string, number>
	): Array<{ id: string; individualTicketId: string }> {
		const passengers: Array<{ id: string; individualTicketId: string }> = [];
		for (const [group, qty] of counts) {
			if (qty <= 0) continue;
			const ticket = option.individualTickets.find((t) => t.group === group);
			if (!ticket) continue;
			for (let i = 0; i < qty; i++) {
				passengers.push({ id: crypto.randomUUID(), individualTicketId: ticket.id });
			}
		}
		return passengers;
	}

	async addActivity(
		option: ActivityOption,
		slot: AvailabilitySlot,
		counts: SvelteMap<string, number>
	): Promise<void> {
		this.isLoading = true;
		this.error = null;
		try {
			const passengers = this.buildPassengers(option, counts);
			if (passengers.length === 0) {
				throw new Error('Selecciona al menos un ticket antes de añadir al carrito');
			}

			if (this.orderId === null) {
				const newOrderId = crypto.randomUUID();
				const payload: CreateOrderPayload = {
					id: newOrderId,
					userId: this.userId ?? undefined,
					booking: {
						id: crypto.randomUUID(),
						optionId: option.id,
						activityDatetime: slot.dateTime,
						passengers
					}
				};
				const res = await fetch(proxyApiRoutes.orders.create, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
				if (!res.ok) throw new Error(`Error ${res.status} al crear el pedido`);
				this.setOrderId(newOrderId);
			} else {
				const payload: AddBookingPayload = {
					id: crypto.randomUUID(),
					optionId: option.id,
					activityDatetime: slot.dateTime,
					passengers
				};
				const res = await fetch(proxyApiRoutes.orders.addBooking(this.orderId), {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
				if (!res.ok) throw new Error(`Error ${res.status} al añadir la actividad`);
			}
			await this.loadOrder();
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Error desconocido';
		} finally {
			this.isLoading = false;
		}
	}

	async removeBooking(bookingId: string): Promise<void> {
		this.isLoading = true;
		this.error = null;
		try {
			const res = await fetch(proxyApiRoutes.bookings.delete(bookingId), { method: 'DELETE' });
			if (!res.ok) throw new Error(`Error ${res.status} al eliminar la reserva`);
			const wasLastBooking = (this.order?.bookings?.length ?? 0) <= 1;
			if (wasLastBooking) {
				this.setOrderId(null);
				this.order = null;
			} else {
				await this.loadOrder();
			}
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Error desconocido';
		} finally {
			this.isLoading = false;
		}
	}

	async loadOrder(): Promise<void> {
		if (!this.orderId) return;
		try {
			const res = await fetch(proxyApiRoutes.orders.getById(this.orderId));
			if (res.status === 404) {
				this.setOrderId(null);
				this.order = null;
				return;
			}
			if (!res.ok) throw new Error(`Error ${res.status} al cargar el pedido`);
			this.order = await res.json();
			await this.resolveActivitySlugs();
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Error desconocido';
		}
	}

	private async resolveActivitySlugs(): Promise<void> {
		const ids = [
			...new Set(
				(this.order?.bookings ?? [])
					.map((b) => b.activityId)
					.filter((id): id is string => !!id && !this.activitySlugs.has(id))
			)
		];
		await Promise.all(
			ids.map(async (id) => {
				try {
					const res = await fetch(proxyApiRoutes.activities.getById(id));
					if (!res.ok) return;
					const activity = await res.json();
					if (activity?.slug) this.activitySlugs.set(id, activity.slug);
				} catch {
					// slug no disponible, el enlace no se mostrará
				}
			})
		);
	}

	async clearShoppingCart(): Promise<void> {
		this.setOrderId(null);
		this.order = null;
		this.error = null;
	}
}

export const shoppingCartStore = new ShoppingCartState();
