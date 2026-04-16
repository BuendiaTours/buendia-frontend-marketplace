<script lang="ts">
	import type { ActivityOption, AvailabilitySlot } from '$lib/types';
	import { SvelteMap } from 'svelte/reactivity';
	import * as m from '$paraglide/messages';
	import { format } from 'date-fns';
	import { es } from 'date-fns/locale';
	import { parseDate } from '@internationalized/date';
	import { getCheckout } from '$lib/stores/checkout.svelte';
	import { formatEuro } from '$lib/utils/currency';
	import { cartStore } from '$lib/stores/shoppingCart.svelte';
	import Callout from '$lib/components/marketplace/Callout.svelte';
	import { formatSlotTime } from '$lib/utils/datetime';

	type Props = {
		option: ActivityOption;
		slots: AvailabilitySlot[];
		selectedSlotId: string | null;
	};

	let { option, slots, selectedSlotId = $bindable() }: Props = $props();

	const checkout = getCheckout();
	const messages = m as unknown as Record<string, () => string>;

	function getSlotDisabledReasons(slot: AvailabilitySlot): string[] {
		if (checkout.totalTickets === 0) return [];
		const reasons: string[] = [];
		const available = slot.availability - slot.reservedAvailability;
		if (available < checkout.totalTickets) {
			reasons.push(
				`Solo quedan ${available} plaza${available !== 1 ? 's' : ''} disponibles y has seleccionado ${checkout.totalTickets}`
			);
		}
		for (const [group, count] of checkout.counts) {
			if (count === 0) continue;
			const ticketItem = slot.tickets.find((t) => checkout.ticketIdToGroup.get(t.id) === group);
			if (!ticketItem) continue;
			const ticketAvailable = ticketItem.stock - ticketItem.reservedStock;
			if (ticketAvailable < count) {
				reasons.push(`Solo quedan ${ticketAvailable} para ${group}, has seleccionado ${count}`);
			}
		}
		return reasons;
	}

	const nextAvailableDates = $derived.by(() => {
		if (!slots.every((s) => checkout.isSlotDisabled(s))) return [];
		const selectedDateStr = checkout.selectedDate?.toString() ?? '';
		const today = new Date().toISOString().slice(0, 10);

		const byDate = new SvelteMap<string, AvailabilitySlot[]>();
		for (const slot of checkout.availability) {
			if (slot.optionId !== option.id) continue;
			const dateStr = new Date(slot.dateTime).toISOString().slice(0, 10);
			if (dateStr === selectedDateStr || dateStr < today) continue;
			const arr = byDate.get(dateStr) ?? [];
			arr.push(slot);
			byDate.set(dateStr, arr);
		}

		return [...byDate.entries()]
			.filter(([, dateSlots]) => dateSlots.some((s) => !checkout.isSlotDisabled(s)))
			.sort(([a], [b]) => a.localeCompare(b))
			.slice(0, 3)
			.map(([dateStr]) => dateStr);
	});

	$effect(() => {
		if (selectedSlotId === null) return;
		const current = slots.find((s) => s.id === selectedSlotId);
		if (current && checkout.isSlotDisabled(current)) selectedSlotId = null;
	});

	const isInCart = $derived.by(() => {
		const slot = slots.find((s) => s.id === selectedSlotId);
		if (!slot) return false;
		return (cartStore.order?.bookings ?? []).some(
			(b) => b.optionId === option.id && b.activityDatetime === slot.dateTime
		);
	});
</script>

<div
	class="checkout-activity-options__option mb-6 flex flex-row gap-4 rounded-lg border-2 border-[var(--color-border-default)] p-4"
	class:bg-neutral-100={slots.every((s) => checkout.isSlotDisabled(s))}
	class:border-accent={slots.some((s) => s.id === selectedSlotId)}
>
	<div class="flex-1">
		<h2 class="h2">{option.title}</h2>
		{#if slots.every((s) => checkout.isSlotDisabled(s))}
			<p class="text-salmon-strong bg-salmon-softer rounded-md p-2">
				No hay suficientes plazas disponibles para esta fecha.
				<!-- {#each getSlotDisabledReasons(slots[0]) as reason, i (i)}
					<span class="block">{reason}</span>
				{/each} -->
			</p>
		{:else if slots.some((s) => s.availability - s.reservedAvailability < 10)}
			<p class="text-salmon-strong bg-salmon-softer rounded-md p-2">
				Sólo quedan {Math.min(...slots.map((s) => s.availability - s.reservedAvailability))} plazas en
				alguna de las opciones
			</p>
		{/if}
		<p>{option.description}</p>
		<p>Duración: {option.duration.quantity} {option.duration.unit}</p>

		{#if slots.some((s) => !checkout.isSlotDisabled(s))}
			<p>Selecciona la hora de inicio</p>
			<div class="flex flex-row gap-4">
				{#each slots as slot (slot.id)}
					<label class="checkout-activity-options__option__slot">
						<input
							type="radio"
							class="radio"
							name="slot"
							value={slot.id}
							checked={selectedSlotId === slot.id}
							disabled={checkout.isSlotDisabled(slot)}
							onchange={() => (selectedSlotId = slot.id)}
						/>
						{formatSlotTime(slot.dateTime)}h
					</label>
					<details class="p-xs mb-4 !hidden">
						<summary class="cursor-pointer"
							>Disponibilidad: {slot.availability - slot.reservedAvailability}</summary
						>
						{#each slot.tickets as ticket (ticket.id)}
							<p>
								{checkout.ticketIdToGroup.get(ticket.id) ?? '?'} ({ticket.id}) — {ticket.price}€
								(stock: {ticket.stock - ticket.reservedStock})
							</p>
						{/each}
					</details>
				{/each}
			</div>

			<!-- Esto probablemente sea un booleano en el activity-option -->
			<p class="neutral-800 mt-6 font-bold">
				Incluye <a href="/conditions" target="_blank" class="underline underline-offset-8"
					>condiciones by buendía</a
				>
			</p>
		{/if}

		{#if nextAvailableDates.length > 0}
			<p class="p-xs mt-2 font-semibold">Próximas fechas disponibles:</p>
			<div class="p-xs mt-1 flex flex-wrap gap-2">
				{#each nextAvailableDates as dateStr (dateStr)}
					<button
						class="e-button e-button-secondary"
						onclick={() => {
							checkout.selectedDate = parseDate(dateStr);
							const firstSlot = checkout.availability
								.filter((s) => s.optionId === option.id)
								.filter((s) => format(new Date(s.dateTime), 'yyyy-MM-dd') === dateStr)
								.find((s) => !checkout.isSlotDisabled(s));
							if (firstSlot) selectedSlotId = firstSlot.id;
						}}
					>
						{format(new Date(dateStr), "d 'de' MMM", { locale: es })}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div
		class="flex w-[200px] shrink-0 flex-col justify-end gap-3 border-l border-[var(--color-border-default)] pl-4"
	>
		{#if slots.some((s) => s.id === selectedSlotId)}
			{@const selectedSlot = slots.find((s) => s.id === selectedSlotId)}
			{#if selectedSlot}
				{@const total = [...checkout.counts].reduce((sum, [group, count]) => {
					const ticket = selectedSlot.tickets.find(
						(t) => checkout.ticketIdToGroup.get(t.id) === group
					);
					return sum + (ticket ? ticket.price * count : 0);
				}, 0)}
				<div class="checkout-activity-options__option__prices flex flex-col gap-2">
					<p class="checkout-activity-options__option__discount text-right">
						<!-- Esto debería venir del back pero todaví no lo tenemos -->
						<strike>108,00</strike> € <span class="text-salmon-strong">-15%</span>
					</p>
					<p class="checkout-activity-options__option__total text-price text-right">
						{formatEuro(total)}
					</p>
					<ul class="p-sm text-right">
						{#each checkout.counts as [group, count] (group)}
							{#if count > 0}
								{@const ticket = selectedSlot.tickets.find(
									(t) => checkout.ticketIdToGroup.get(t.id) === group
								)}
								{#if ticket}
									<li>
										<span class="p-sm font-bold text-neutral-700"
											>{count}
											{messages[`enum_passengerKind_${group}_name`]?.() ?? group} ×
											{formatEuro(ticket.price)}
										</span>
									</li>
								{/if}
							{/if}
						{/each}
					</ul>
					<p class="p-sm text-right text-neutral-600">Tasas e impuestos incluidos</p>
				</div>
			{/if}
		{/if}

		{#if slots.some((s) => s.id === selectedSlotId)}
			{@const selectedSlot = slots.find((s) => s.id === selectedSlotId)}
			<div class="checkout-activity-options__option__actions">
				{#if cartStore.error}
					<p class="p-xs text-salmon-strong mb-2">{cartStore.error}</p>
				{/if}
				<button
					type="button"
					class="e-button e-button-primary w-full"
					disabled={cartStore.isLoading || !selectedSlot}
					onclick={async () => {
						if (!selectedSlot) return;
						await cartStore.addActivity(option, selectedSlot, checkout.counts);
					}}
				>
					{cartStore.isLoading ? 'Añadiendo…' : 'Reservar ahora'}
				</button>
				{#if isInCart}
					<Callout
						style="info"
						size="small"
						items={[
							{
								id: 'in-cart',
								icon: 'CartLarge4',
								title: 'En tu carrito',
								description: ''
							}
						]}
						wrapperClass="mt-2 items-center"
					/>
				{:else}
					<button
						type="button"
						class="e-button e-button-secondary mt-3 w-full"
						disabled={cartStore.isLoading || !selectedSlot}
						onclick={async () => {
							if (!selectedSlot) return;
							await cartStore.addActivity(option, selectedSlot, checkout.counts);
						}}
					>
						{cartStore.isLoading ? 'Añadiendo…' : 'Añadir al carrito'}
					</button>
				{/if}
			</div>
		{/if}
	</div>
</div>
