import { SvelteMap } from 'svelte/reactivity';
import { getContext, setContext } from 'svelte';
import type { AvailabilityData } from '$lib/types';
import type { DateValue } from '@internationalized/date';

const CHECKOUT_KEY = Symbol('checkout');

class CheckoutState {
	activityId: string;
	activityOptions = $state([]);

	availability = $state<AvailabilityData>({});
	selectedDate = $state<DateValue | null>(null);
	counts = new SvelteMap<string, number>();
	isLoading = $state(true);
	error = $state<string | null>(null);

	ticketMaxMap = $derived.by(() => {
		const map = new SvelteMap<string, number>();
		for (const dateData of Object.values(this.availability)) {
			for (const [code, available] of Object.entries(dateData)) {
				map.set(code, Math.max(map.get(code) ?? 0, available));
			}
		}
		return map;
	});

	ticketEntries = $derived([...this.ticketMaxMap.entries()]);

	totalTickets = $derived([...this.counts.values()].reduce((sum, v) => sum + v, 0));

	selectedDateAvailability = $derived(
		this.selectedDate ? (this.availability[this.selectedDate.toString()] ?? null) : null
	);

	cartIsReady = $derived(
		this.selectedDate !== null && [...this.counts.values()].some((v) => v > 0)
	);

	checkDateDisabled = $derived.by(() => {
		const snapshot = [...this.counts.entries()];
		const avail = this.availability;
		return (date: DateValue): boolean => {
			const dateStr = date.toString();
			const dateAvail = avail[dateStr];
			if (!dateAvail) return true;
			for (const [code, count] of snapshot) {
				if (count <= 0) continue;
				if ((dateAvail[code] ?? 0) < count) return true;
			}
			return false;
		};
	});

	constructor(activityId: string) {
		this.activityId = activityId;
		$effect(() => {
			this.loadAvailability();
		});
	}

	async loadAvailability() {
		this.isLoading = true;
		this.error = null;
		try {
			const r = await fetch(`/api/availability-options/${this.activityId}`);
			if (!r.ok) throw new Error(`Error ${r.status}`);
			const data: AvailabilityData = await r.json();
			this.availability = data;
			const codes = [...new Set(Object.values(data).flatMap(Object.keys))];
			this.counts.clear();
			for (const code of codes) this.counts.set(code, 0);
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Error desconocido';
		} finally {
			this.isLoading = false;
		}
	}
}

export function createCheckout(activityId: string): CheckoutState {
	return setContext(CHECKOUT_KEY, new CheckoutState(activityId));
}

export function getCheckout(): CheckoutState {
	return getContext<CheckoutState>(CHECKOUT_KEY);
}
