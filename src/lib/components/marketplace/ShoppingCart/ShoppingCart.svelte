<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import type { AvailabilityData } from '$lib/types';
	import SCStepCounter from './SCStepCounter.svelte';

	let { activityId }: { activityId: string } = $props();

	let availability = $state<AvailabilityData>({});
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	let counts = new SvelteMap<string, number>();

	// { ticketTypeCode: maxAvailableAcrossAllDates }
	const ticketMaxMap = $derived.by<SvelteMap<string, number>>(() => {
		const map = new SvelteMap<string, number>();
		for (const dateData of Object.values(availability)) {
			for (const [code, available] of Object.entries(dateData)) {
				map.set(code, Math.max(map.get(code) ?? 0, available));
			}
		}
		return map;
	});

	const ticketEntries = $derived([...ticketMaxMap.entries()]);

	$effect(() => {
		isLoading = true;
		error = null;
		fetch(`/api/availability-options/${activityId}`)
			.then((r) => {
				if (!r.ok) throw new Error(`Error ${r.status}`);
				return r.json();
			})
			.then((data: AvailabilityData) => {
				availability = data;
				const codes = [...new Set(Object.values(data).flatMap(Object.keys))];
				counts.clear();
				for (const code of codes) counts.set(code, 0);
			})
			.catch((e: unknown) => {
				error = e instanceof Error ? e.message : 'Error desconocido';
			})
			.finally(() => {
				isLoading = false;
			});
	});
</script>

<div class="carrito">
	{#if isLoading}
		<div class="carrito__loading space-y-3 p-4">
			<div class="h-5 w-3/4 animate-pulse rounded bg-neutral-200"></div>
			<div class="h-5 w-1/2 animate-pulse rounded bg-neutral-200"></div>
			<div class="h-10 w-full animate-pulse rounded bg-neutral-200"></div>
		</div>
	{:else if error}
		<div class="carrito__error p-4 text-sm text-red-600">{error}</div>
	{:else if ticketEntries.length === 0}
		<div class="carrito__empty p-4 text-sm text-neutral-500">Sin disponibilidad</div>
	{:else}
		<div class="carrito__tickets space-y-4 p-4">
			{#each ticketEntries as [code, maxAvailable] (code)}
				<SCStepCounter
					key={code}
					value={counts.get(code) ?? 0}
					maxvalue={maxAvailable}
					onchange={(v) => counts.set(code, v)}
				/>
			{/each}
		</div>
	{/if}
</div>
