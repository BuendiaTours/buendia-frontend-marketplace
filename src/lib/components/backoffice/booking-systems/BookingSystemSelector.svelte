<script lang="ts">
	/**
	 * Orchestrator component for booking system configuration.
	 * Renders a booking system selector and dynamically loads the matching
	 * adapter's form component. Handles submit delegation to the adapter.
	 */
	import * as m from '$paraglide/messages';
	import type { BookingSystem } from '$core/bookings/enums';
	import { getAdapter, getAllAdapters } from './registry';

	type Props = {
		optionId: string;
		optionTitle: string;
		onSuccess?: () => void;
		onError?: () => void;
	};

	let { optionId, optionTitle, onSuccess, onError }: Props = $props();

	let selectedSystem = $state<BookingSystem | ''>('');
	let formData = $state<Record<string, unknown>>({});
	let submitting = $state(false);

	const adapter = $derived(
		selectedSystem ? getAdapter(selectedSystem as BookingSystem) : undefined
	);

	const allAdapters = getAllAdapters();

	const canSubmit = $derived(adapter !== undefined && !submitting);

	$effect(() => {
		if (selectedSystem) {
			formData = {};
		}
	});

	async function handleSubmit() {
		if (!adapter || submitting) return;

		submitting = true;
		try {
			await adapter.submit(fetch, { optionId, optionTitle }, formData);
			onSuccess?.();
		} catch {
			onError?.();
		} finally {
			submitting = false;
		}
	}
</script>

<div class="grid max-w-lg gap-4">
	<div class="form-control w-full">
		<label class="label" for="bookingSystem">
			<span class="label-text">{m.activities_bookingSystemLabel()}</span>
		</label>
		<select id="bookingSystem" class="select select-bordered w-full" bind:value={selectedSystem}>
			<option value="" disabled>{m.activities_bookingSystemPlaceholder()}</option>
			{#each allAdapters as a (a.key)}
				<option value={a.key}>{a.label}</option>
			{/each}
		</select>
	</div>

	{#if adapter}
		<adapter.formComponent bind:formData disabled={submitting} />
	{/if}

	<div class="mt-2">
		<button type="button" class="btn btn-primary" disabled={!canSubmit} onclick={handleSubmit}>
			{#if submitting}
				<span class="loading loading-spinner loading-sm"></span>
			{/if}
			{m.activities_bookingSystemSubmitButton()}
		</button>
	</div>
</div>
