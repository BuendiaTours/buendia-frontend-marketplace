<script lang="ts">
	import type { AvailabilityOption } from '$lib/types';
	import { format } from 'date-fns';

	let { activityId }: { activityId: string } = $props();

	let options = $state<AvailabilityOption[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	$effect(() => {
		isLoading = true;
		error = null;
		fetch(`/api/availability-options/${activityId}`)
			.then((r) => {
				if (!r.ok) throw new Error(`Error ${r.status}`);
				return r.json();
			})
			.then((data) => {
				options = data;
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
	{:else if options.length === 0}
		<div class="carrito__empty p-4 text-sm text-neutral-500">Sin disponibilidad</div>
	{:else}
		<pre class="overflow-auto rounded bg-neutral-100 p-4 text-xs">{JSON.stringify(
				options,
				null,
				2
			)}</pre>
	{/if}
</div>
