<script lang="ts">
	import type { ActivityOption, AvailabilitySlot } from '$lib/types';
	import * as m from '$paraglide/messages';
	import { format } from 'date-fns';
	import { getCheckout } from '$lib/stores/checkout.svelte';
	import { formatEuro } from '$lib/utils/currency';

	type Props = {
		option: ActivityOption;
		slots: AvailabilitySlot[];
		selectedSlotId: string | null;
	};

	let { option, slots, selectedSlotId = $bindable() }: Props = $props();

	const checkout = getCheckout();
	const messages = m as unknown as Record<string, () => string>;

	function isSlotDisabled(slot: AvailabilitySlot): boolean {
		if (checkout.totalTickets === 0) return false;
		if (slot.availability - slot.reservedAvailability < checkout.totalTickets) return true;
		for (const [group, count] of checkout.counts) {
			if (count === 0) continue;
			const ticketItem = slot.tickets.find((t) => checkout.ticketIdToGroup.get(t.id) === group);
			if (!ticketItem) continue;
			if (ticketItem.stock - ticketItem.reservedStock < count) return true;
		}
		return false;
	}

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
				reasons.push(`Solo quedan ${ticketAvailable} para «${group}», has seleccionado ${count}`);
			}
		}
		return reasons;
	}

	$effect(() => {
		if (selectedSlotId === null) return;
		const current = slots.find((s) => s.id === selectedSlotId);
		if (current && isSlotDisabled(current)) selectedSlotId = null;
	});
</script>

<div
	class="sc-activity-options__option mb-6 rounded-lg border-2 border-[var(--color-border-default)] p-4"
	class:bg-neutral-100={slots.every((s) => isSlotDisabled(s))}
	class:border-accent={slots.some((s) => s.id === selectedSlotId)}
>
	<h2 class="h2">{option.title}</h2>
	{#if slots.every((s) => isSlotDisabled(s))}
		<p class="text-salmon-strong bg-salmon-softer rounded-md p-2">
			No hay suficientes plazas disponibles para esta fecha.
		</p>
		{#each getSlotDisabledReasons(slots[0]) as reason, i (i)}
			<p class="p-sm mt-1 text-neutral-600">• {reason}</p>
		{/each}
	{:else if slots.some((s) => s.availability - s.reservedAvailability < 10)}
		<p class="text-salmon-strong bg-salmon-softer rounded-md p-2">
			Sólo quedan {Math.min(...slots.map((s) => s.availability - s.reservedAvailability))} plazas en alguna
			de las opciones
		</p>
	{/if}
	<p>{option.description}</p>
	<p>Duración: {option.duration.quantity} {option.duration.unit}</p>
	<div class="flex flex-row gap-4">
		<div class="flex-1">
			<p>Selecciona la hora de inicio</p>
			<div class="flex flex-row gap-4"></div>
			{#each slots as slot (slot.id)}
				<div>
					<label>
						<input
							type="radio"
							class="radio"
							name="slot"
							value={slot.id}
							checked={selectedSlotId === slot.id}
							disabled={isSlotDisabled(slot)}
							onchange={() => (selectedSlotId = slot.id)}
						/>
						{format(new Date(slot.dateTime), "HH:mm'h'")}
					</label>
					<details class="p-xs mb-4">
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
				</div>
			{/each}
		</div>
		<div
			class="flex w-[200px] shrink-0 flex-col gap-3 border-l border-[var(--color-border-default)] pl-4"
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
					<div class="sc-activity-options__option__prices flex flex-col gap-2">
						<p class="text-price text-right">
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
				<div class="cs-activity-option__actions">
					<button type="button" class="e-button e-button-primary">Reservar ahora</button>
					<button type="button" class="e-button e-button-secondary mt-3">Añadir al carrito</button>
				</div>
			{/if}
		</div>
	</div>
</div>
