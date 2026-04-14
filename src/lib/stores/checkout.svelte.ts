import { SvelteMap } from 'svelte/reactivity';
import { getContext, setContext } from 'svelte';
import type { ActivityOption, AvailabilityData, AvailabilitySlot } from '$lib/types';
import type { DateValue } from '@internationalized/date';
import { proxyApiRoutes } from '$lib/api/proxy-routes';
import { format } from 'date-fns';

const CHECKOUT_KEY = Symbol('checkout');

class CheckoutState {
	activityId: string;
	activityOptions = $state<ActivityOption[]>([]);

	availability = $state<AvailabilitySlot[]>([]);
	selectedDate = $state<DateValue | null>(null);
	counts = new SvelteMap<string, number>();
	isLoading = $state(true);
	error = $state<string | null>(null);

	// Slots agrupados por fecha YYYY-MM-DD — usado para deshabilitar días y para el futuro picker de horas
	slotsByDate = $derived.by(() => {
		const map = new SvelteMap<string, AvailabilitySlot[]>();
		for (const slot of this.availability) {
			const d = format(new Date(slot.dateTime), 'yyyy-MM-dd');
			const arr = map.get(d) ?? [];
			arr.push(slot);
			map.set(d, arr);
		}
		return map;
	});

	// ticketId (UUID) → group ("ADULT", "CHILD"…) — puente entre disponibilidad y contadores
	ticketIdToGroup = $derived.by(() => {
		const map = new SvelteMap<string, string>();
		for (const opt of this.activityOptions)
			for (const t of opt.individualTickets) map.set(t.id, t.group);
		return map;
	});

	// group → [ticketIds] — permite buscar disponibilidad de un grupo en un slot
	groupToTicketIds = $derived.by(() => {
		const map = new SvelteMap<string, string[]>();
		for (const opt of this.activityOptions)
			for (const t of opt.individualTickets) {
				const ids = map.get(t.group) ?? [];
				ids.push(t.id);
				map.set(t.group, ids);
			}
		return map;
	});

	// Máximo disponible por grupo en cualquier slot/fecha — upper bound para los CheckoutStepCounter
	ticketMaxMap = $derived.by(() => {
		const map = new SvelteMap<string, number>();
		for (const slot of this.availability)
			for (const t of slot.tickets) {
				const group = this.ticketIdToGroup.get(t.id);
				if (!group) continue;
				const avail = t.stock - t.reservedStock;
				map.set(group, Math.max(map.get(group) ?? 0, avail));
			}
		return map;
	});

	ticketEntries = $derived([...this.ticketMaxMap.entries()]);

	totalTickets = $derived([...this.counts.values()].reduce((sum, v) => sum + v, 0));

	cartIsReady = $derived(
		this.selectedDate !== null && [...this.counts.values()].some((v) => v > 0)
	);

	// Slots del día seleccionado — para el futuro picker de horario/opción
	selectedDateSlots = $derived(
		this.selectedDate ? (this.slotsByDate.get(this.selectedDate.toString()) ?? []) : []
	);

	// Un día está habilitado si existe AL MENOS un slot que pueda satisfacer todos los grupos seleccionados simultáneamente
	checkDateDisabled = $derived.by(() => {
		const snapshot = [...this.counts.entries()];
		const slotsByDate = this.slotsByDate;
		const groupToTicketIds = this.groupToTicketIds;
		return (date: DateValue): boolean => {
			const slots = slotsByDate.get(date.toString());
			if (!slots?.length) return true;
			for (const slot of slots) {
				let ok = true;
				for (const [group, count] of snapshot) {
					if (count <= 0) continue;
					const ids = groupToTicketIds.get(group) ?? [];
					const maxAvail = Math.max(
						0,
						...slot.tickets.filter((t) => ids.includes(t.id)).map((t) => t.stock - t.reservedStock)
					);
					if (maxAvail < count) {
						ok = false;
						break;
					}
				}
				if (ok) return false; // algún slot puede cumplir — día habilitado
			}
			return true; // ningún slot cumple — día deshabilitado
		};
	});

	isSlotDisabled(slot: AvailabilitySlot): boolean {
		if (this.totalTickets === 0) return false;
		if (slot.availability - slot.reservedAvailability < this.totalTickets) return true;
		for (const [group, count] of this.counts) {
			if (count === 0) continue;
			const ticketItem = slot.tickets.find((t) => this.ticketIdToGroup.get(t.id) === group);
			if (!ticketItem) continue;
			if (ticketItem.stock - ticketItem.reservedStock < count) return true;
		}
		return false;
	}

	constructor(activityId: string) {
		this.activityId = activityId;

		// $effect(() => { console.warn('availability', $state.snapshot(this.availability)); });
		// $effect(() => { console.warn('slotsByDate', $state.snapshot(this.slotsByDate)); });
		// $effect(() => { console.warn('ticketIdToGroup', $state.snapshot(this.ticketIdToGroup)); });
		// $effect(() => { console.warn('groupToTicketIds', $state.snapshot(this.groupToTicketIds)); });
		// $effect(() => { console.warn('counts', $state.snapshot(this.counts)); });

		$effect(() => {
			this.loadAvailability();
		});
		// Inicializa counts cuando se establecen los activityOptions
		$effect(() => {
			const groups = [
				...new Set(this.activityOptions.flatMap((o) => o.individualTickets).map((t) => t.group))
			];
			this.counts.clear();
			for (const g of groups) this.counts.set(g, 0);
		});
	}

	async loadAvailability() {
		this.isLoading = true;
		this.error = null;
		try {
			const r = await fetch(proxyApiRoutes.availabilityOptions.byActivity(this.activityId));
			if (!r.ok) throw new Error(`Error ${r.status}`);
			const data: AvailabilityData = await r.json();
			this.availability = data;
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Error desconocido';
		} finally {
			this.isLoading = false;
		}
	}

	private loadedFromDates = new Set<string>();

	async loadAvailabilityFrom(fromDate: string) {
		if (this.loadedFromDates.has(fromDate)) return;
		this.loadedFromDates.add(fromDate);
		try {
			const r = await fetch(
				proxyApiRoutes.availabilityOptions.byActivity(this.activityId, fromDate)
			);
			if (!r.ok) throw new Error(`Error ${r.status}`);
			const data: AvailabilityData = await r.json();
			const existingIds = new Set(this.availability.map((s) => s.id));
			this.availability = [...this.availability, ...data.filter((s) => !existingIds.has(s.id))];
		} catch (e) {
			console.error('Failed to load additional availability:', e);
			this.loadedFromDates.delete(fromDate);
		}
	}
}

export function createCheckout(activityId: string): CheckoutState {
	return setContext(CHECKOUT_KEY, new CheckoutState(activityId));
}

export function getCheckout(): CheckoutState {
	return getContext<CheckoutState>(CHECKOUT_KEY);
}
