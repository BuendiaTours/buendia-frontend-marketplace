<script lang="ts">
	import { getCheckout } from '$lib/stores/checkout.svelte';
	import SCStepCounter from './SCStepCounter.svelte';
	import SCMeltDatepicker from './SCMeltDatepicker.svelte';

	const checkout = getCheckout();
</script>

<div class="carrito">
	{#if checkout.isLoading}
		<div class="carrito__loading space-y-3 p-4">
			<div class="h-5 w-3/4 animate-pulse rounded bg-neutral-200"></div>
			<div class="h-5 w-1/2 animate-pulse rounded bg-neutral-200"></div>
			<div class="h-10 w-full animate-pulse rounded bg-neutral-200"></div>
		</div>
	{:else if checkout.error}
		<div class="carrito__error p-4 text-sm text-red-600">{checkout.error}</div>
	{:else if checkout.ticketEntries.length === 0}
		<div class="carrito__empty p-4 text-sm text-neutral-500">Sin disponibilidad</div>
	{:else}
		<div class="carrito__tickets space-y-4 p-4">
			<p class="p-base">Número total de tickets: {checkout.totalTickets}</p>
			{#each checkout.ticketEntries as [code, maxAvailable] (code)}
				<SCStepCounter
					key={code}
					value={checkout.counts.get(code) ?? 0}
					maxvalue={maxAvailable}
					onchange={(v) => checkout.counts.set(code, v)}
				/>
			{/each}
		</div>

		<SCMeltDatepicker
			isDateDisabled={checkout.checkDateDisabled}
			onSelect={(date) => (checkout.selectedDate = date)}
		/>
	{/if}
</div>
