<script lang="ts">
	import { ClockCircle, ByBuendia, CalendarCheck, MoneyBack } from '$lib/icons/Linear';
	import Badge from '../Badge.svelte';
	import Callout from '../Callout.svelte';
	import type { ActivityOption, AvailabilitySlot } from '$lib/types';
	import { getCheckout } from '$lib/stores/checkout.svelte';
	import { shoppingCartStore } from '$lib/stores/shoppingCart.svelte';
	import { formatEuro } from '$lib/utils/currency';
	import { formatSlotTime } from '$lib/utils/datetime';
	import { format } from 'date-fns';
	import { es } from 'date-fns/locale';
	import { parseDate } from '@internationalized/date';
	import { goto } from '$app/navigation';
	import * as m from '$paraglide/messages';

	type OptionWithSlots = { option: ActivityOption; slots: AvailabilitySlot[] };

	type Props = {
		options: OptionWithSlots[];
		selectedSlotId?: string | null;
		wrapperClass?: string;
	};

	let { options, selectedSlotId = $bindable(null), wrapperClass }: Props = $props();

	const checkout = getCheckout();
	const messages = m as unknown as Record<string, () => string>;

	const isStaticMode = $derived(options.every(({ slots }) => slots.length === 0));

	let selectedOptionId = $state<string | null>(
		options.find(({ option }) => !option.disabled)?.option.id ?? null
	);

	function isSelected({ option, slots }: OptionWithSlots): boolean {
		if (isStaticMode) return selectedOptionId === option.id;
		return slots.some((s) => s.id === selectedSlotId);
	}

	function isDisabled({ option, slots }: OptionWithSlots): boolean {
		if (isStaticMode) return option.disabled;
		return slots.every((s) => checkout.isSlotDisabled(s));
	}

	function selectOption(optionWithSlots: OptionWithSlots) {
		if (isDisabled(optionWithSlots)) return;
		if (isStaticMode) {
			selectedOptionId = optionWithSlots.option.id;
		} else {
			const first = optionWithSlots.slots.find((s) => !checkout.isSlotDisabled(s));
			if (first) selectedSlotId = first.id;
		}
	}

	function getNextAvailableDates(optionId: string): string[] {
		const selectedDateStr = checkout.selectedDate?.toString() ?? '';
		const today = new Date().toISOString().slice(0, 10);
		const byDate: Record<string, AvailabilitySlot[]> = {};
		for (const slot of checkout.availability) {
			if (slot.optionId !== optionId) continue;
			const dateStr = new Date(slot.dateTime).toISOString().slice(0, 10);
			if (dateStr === selectedDateStr || dateStr < today) continue;
			byDate[dateStr] ??= [];
			byDate[dateStr].push(slot);
		}
		return Object.entries(byDate)
			.filter(([, dateSlots]) => dateSlots.some((s) => !checkout.isSlotDisabled(s)))
			.sort(([a], [b]) => a.localeCompare(b))
			.slice(0, 3)
			.map(([dateStr]) => dateStr);
	}

	function calcSlotTotal(slot: AvailabilitySlot): number {
		return [...checkout.counts].reduce((sum, [group, count]) => {
			const ticket = slot.tickets.find((t) => checkout.ticketIdToGroup.get(t.id) === group);
			return sum + (ticket ? ticket.price * count : 0);
		}, 0);
	}

	function getSelectedSlot(slots: AvailabilitySlot[]): AvailabilitySlot | undefined {
		return slots.find((s) => s.id === selectedSlotId);
	}

	function getMinPrice(slots: AvailabilitySlot[]): number | null {
		const available = slots.filter((s) => !checkout.isSlotDisabled(s));
		if (available.length === 0) return null;
		const selectedGroups = [...checkout.counts]
			.filter(([, count]) => count > 0)
			.map(([group]) => group);
		const prices = available.flatMap((slot) =>
			slot.tickets
				.filter((t) => {
					const group = checkout.ticketIdToGroup.get(t.id);
					return (
						selectedGroups.length === 0 || (group !== undefined && selectedGroups.includes(group))
					);
				})
				.map((t) => t.price)
		);
		const min = Math.min(...prices);
		return Number.isFinite(min) ? min : null;
	}

	function isInCart(option: ActivityOption, slots: AvailabilitySlot[]): boolean {
		const slot = getSelectedSlot(slots);
		if (!slot) return false;
		return (shoppingCartStore.order?.bookings ?? []).some(
			(b) => b.optionId === option.id && b.activityDatetime === slot.dateTime
		);
	}
</script>

<div class="ticket-selector flex flex-col gap-5 {wrapperClass}">
	{#each options as optionWithSlots (optionWithSlots.option.id)}
		{@const { option, slots } = optionWithSlots}
		{@const selected = isSelected(optionWithSlots)}
		{@const disabled = isDisabled(optionWithSlots)}
		{@const selectedSlot = getSelectedSlot(slots)}
		{@const nextDates = disabled ? getNextAvailableDates(option.id) : []}
		<div
			class="
        flex flex-col gap-5 border-[2px] border-solid lg:relative
        lg:flex-row lg:gap-6
        {selected
				? 'border-violet-500'
				: disabled
					? 'border-neutral-200'
					: 'cursor-pointer border-neutral-200'}
        rounded-lg p-4 lg:p-6
      "
			role="radio"
			aria-checked={selected}
			tabindex="0"
			onclick={!disabled ? () => selectOption(optionWithSlots) : undefined}
			onkeydown={!disabled ? (e) => e.key === 'Enter' && selectOption(optionWithSlots) : undefined}
		>
			<div class="flex w-full flex-col gap-5 lg:gap-6">
				<div class="flex flex-col items-start gap-2">
					<div class="flex justify-between gap-5">
						<p class="h2">{option.title}</p>
						<div
							class="
                {disabled ? '' : 'lg:absolute lg:top-7 lg:right-6'}
                flex h-5 w-5 shrink-0 grow-0
                basis-5 items-center justify-center
                border border-solid
                {selected
								? 'border-violet-500'
								: disabled
									? 'border-neutral-300 bg-neutral-200'
									: 'border-neutral-300'}
                rounded-full
              "
						>
							{#if selected}
								<div class="h-2 w-2 rounded-full bg-violet-500"></div>
							{/if}
						</div>
					</div>
					{#if option.totalTickets < 9}
						<Badge
							data={{
								title:
									option.totalTickets === 1
										? `Solo queda ${option.totalTickets} plaza`
										: `Solo quedan ${option.totalTickets} plazas`,
								color: 'bg-salmon-100 text-salmon-700'
							}}
							wrapperClass="p-sm"
						/>
					{/if}
					{#if option.description}
						<p class="p-base mb-1 text-neutral-600">{option.description}</p>
					{/if}
					{#if disabled}
						<div class="flex flex-col gap-4">
							{#if !isStaticMode}
								<div class="text-error-500 p-base rounded-lg bg-neutral-100 p-3">
									No hay suficientes plazas disponibles para esta fecha.
								</div>
							{/if}
							{#if nextDates.length > 0}
								<div class="flex flex-col gap-2">
									<p class="p-sm font-bold text-neutral-800">Próximas fechas disponibles:</p>
									<div class="flex flex-wrap gap-2">
										{#each nextDates as dateStr (dateStr)}
											<button
												class="p-base cursor-pointer rounded-lg border border-solid border-neutral-300 px-4 py-3 text-neutral-800"
												onclick={(e) => {
													e.stopPropagation();
													checkout.selectedDate = parseDate(dateStr);
													const firstSlot = checkout.availability
														.filter((s) => s.optionId === option.id)
														.filter((s) => format(new Date(s.dateTime), 'yyyy-MM-dd') === dateStr)
														.find((s) => !checkout.isSlotDisabled(s));
													if (firstSlot) selectedSlotId = firstSlot.id;
												}}
											>
												{format(new Date(dateStr), "EEE d 'de' MMM", { locale: es })}
											</button>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/if}
				</div>
				{#if !disabled}
					<div class="flex flex-col {selected ? 'gap-5 lg:gap-6' : 'gap-2'}">
						{#if option.duration.quantity && option.duration.unit && selected}
							<p class="p-base flex gap-2 font-bold text-neutral-800">
								<ClockCircle class="size-6 flex-shrink-0 flex-grow-0 basis-6" />
								Duración: {option.duration.quantity}
								{option.duration.unit}
							</p>
						{/if}
						{#if selected && !isStaticMode && slots.some((s) => !checkout.isSlotDisabled(s))}
							<div class="flex flex-col gap-2">
								<p class="p font-bold text-neutral-800">Selecciona la hora de inicio</p>
								<div class="flex flex-wrap gap-2">
									{#each slots as slot (slot.id)}
										{@const slotDisabled = checkout.isSlotDisabled(slot)}
										<button
											class="rounded-lg border border-solid px-4 py-3 font-bold {selectedSlotId ===
											slot.id
												? 'border-violet-500 bg-violet-500 text-white'
												: slotDisabled
													? 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400'
													: 'cursor-pointer border-neutral-300 bg-white text-neutral-800'}"
											type="button"
											aria-pressed={selectedSlotId === slot.id}
											disabled={slotDisabled}
											onclick={(e) => {
												e.stopPropagation();
												selectedSlotId = slot.id;
											}}
										>
											{formatSlotTime(slot.dateTime)}h
										</button>
									{/each}
								</div>
							</div>
						{/if}
						<div class="flex flex-col gap-2">
							<p class="p-base flex gap-2 font-bold text-neutral-800">
								{#if selected}
									<ByBuendia class="h-6 shrink-0 grow-0 basis-6" />
									Condiciones by buendía
								{:else}
									Incluye condiciones by buendía
								{/if}
							</p>
							{#if selected}
								<p class="p-base flex gap-2 text-neutral-800">
									<CalendarCheck class="h-6 shrink-0 grow-0 basis-6" />
									Cancela sin coste hasta 1 minuto antes del inicio
								</p>
								<p class="p-base flex gap-2 text-neutral-800">
									<MoneyBack class="h-6 shrink-0 grow-0 basis-6" />
									Te devolvemos el dinero si no te gusta. Sin explicaciones
								</p>
							{/if}
						</div>
					</div>
				{/if}
			</div>
			{#if !disabled}
				<div
					class="flex flex-col text-nowrap lg:justify-end lg:border-l lg:border-solid lg:border-neutral-200 lg:pl-6 lg:text-right
"
				>
					{#if selectedSlot}
						{@const total = calcSlotTotal(selectedSlot)}
						<div class="flex flex-col">
							<p class="text-price text-right">{formatEuro(total)}</p>
							<ul class="p-sm text-right">
								{#each checkout.counts as [group, count] (group)}
									{#if count > 0}
										{@const ticket = selectedSlot.tickets.find(
											(t) => checkout.ticketIdToGroup.get(t.id) === group
										)}
										{#if ticket}
											<li>
												<span class="p-sm font-bold text-neutral-700">
													{count}
													{messages[`enum_passengerKind_${group}_name`]?.() ?? group} ×
													{formatEuro(ticket.price)}
												</span>
											</li>
										{/if}
									{/if}
								{/each}
							</ul>
							<p class="p-sm text-neutral-600">Tasas e impuestos incluidos</p>
						</div>
					{:else if !isStaticMode}
						{@const minPrice = getMinPrice(slots)}
						{#if minPrice !== null}
							<p class="text-price">{formatEuro(minPrice)}</p>
							<p class="p-sm font-bold text-neutral-700">por persona</p>
							<p class="p-sm text-neutral-600">Tasas e impuestos incluidos</p>
						{/if}
					{:else}
						{#each option.individualTickets as ticket (ticket.id)}
							<div>
								{#if ticket.discount && ticket.newPrice}
									<div class="flex gap-1 sm:justify-end">
										<p class="p-sm font-bold text-neutral-700 line-through">
											{formatEuro(ticket.price)}
										</p>
										<p class="p-sm text-salmon-700 font-bold">{ticket.discount}</p>
									</div>
									<p class="text-price text-salmon-700">{formatEuro(ticket.newPrice)}</p>
								{:else}
									<p class="text-price">{formatEuro(ticket.price)}</p>
								{/if}
								<p class="p-sm font-bold text-neutral-700">
									Desde {formatEuro(ticket.price)} por persona
								</p>
								<p class="p-sm text-neutral-600">Tasas e impuestos incluidos</p>
							</div>
						{/each}
					{/if}

					{#if !isStaticMode && selected}
						<div class="mt-3 flex flex-col gap-1">
							{#if shoppingCartStore.error}
								<p class="p-xs text-salmon-strong">{shoppingCartStore.error}</p>
							{/if}
							<button
								class="e-button"
								type="button"
								disabled={shoppingCartStore.isLoading || !selectedSlot}
								onclick={async (e) => {
									e.stopPropagation();
									if (!selectedSlot) return;
									await shoppingCartStore.addActivity(option, selectedSlot, checkout.counts);
									if (!shoppingCartStore.error) goto('/checkout-order');
								}}
								>Reservar ahora
							</button>
							{#if isInCart(option, slots)}
								<Callout
									style="info"
									size="small"
									items={[
										{ id: 'in-cart', icon: 'CartLarge4', title: 'En tu carrito', description: '' }
									]}
									wrapperClass="mt-2 items-center"
								/>
							{:else}
								<button
									class="e-button e-button-secondary"
									type="button"
									disabled={shoppingCartStore.isLoading || !selectedSlot}
									onclick={async (e) => {
										e.stopPropagation();
										if (!selectedSlot) return;
										await shoppingCartStore.addActivity(option, selectedSlot, checkout.counts);
									}}
								>
									{shoppingCartStore.isLoading ? 'Añadiendo…' : 'Añadir al carrito'}
								</button>
							{/if}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/each}
</div>
