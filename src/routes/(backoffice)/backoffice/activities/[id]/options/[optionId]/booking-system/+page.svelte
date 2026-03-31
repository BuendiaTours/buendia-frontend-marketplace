<script lang="ts">
	/**
	 * Booking System tab — indexes an option in an external booking system.
	 * If already indexed, shows read-only data with status and an unlink action.
	 * If not indexed, renders the BookingSystemSelector orchestrator.
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import { getContext } from 'svelte';
	import {
		BOOKING_SYSTEM_OPTIONS,
		CORE_ACTIVITY_STATUS_OPTIONS,
		INDEXATION_PRIORITY_OPTIONS
	} from '$lib/labels/bookings';
	import PureHtmlDialog from '$lib/components/backoffice/PureHtmlDialog.svelte';
	import BookingSystemSelector from '$lib/components/backoffice/booking-systems/BookingSystemSelector.svelte';

	let { data }: PageProps = $props();

	const addToast =
		getContext<
			(toast: { data: { title: string; description: string; type: 'success' | 'error' } }) => void
		>('activityToast');

	let unlinking = $state(false);
	let unlinkDialog = $state<PureHtmlDialog>();

	const isIndexed = $derived(data.indexation !== null);

	const statusLabel = $derived(
		CORE_ACTIVITY_STATUS_OPTIONS.find((o) => o.id === data.indexation?.status)?.name ??
			data.indexation?.status
	);

	const bookingSystemLabel = $derived(
		BOOKING_SYSTEM_OPTIONS.find((o) => o.id === data.indexation?.bookingSystem)?.name ??
			data.indexation?.bookingSystem
	);

	const priorityLabel = $derived(
		INDEXATION_PRIORITY_OPTIONS.find((o) => o.id === data.indexation?.priority)?.name ??
			data.indexation?.priority
	);

	function getStatusClass(status: string): string {
		switch (status) {
			case 'ACTIVE':
			case 'RUNNING':
				return 'status-success';
			case 'PENDING':
			case 'PENDING_TO_MATCH':
				return 'status-warning';
			case 'FAILED':
				return 'status-error';
			default:
				return 'status-neutral';
		}
	}

	async function handleUnlink() {
		unlinking = true;
		try {
			// TODO: endpoint not yet developed
			// await ACTIVITY_REQUEST.deleteIndexationActivity(fetch, data.option.id);
			unlinkDialog?.close();
			addToast({
				data: {
					title: m.activities_bookingSystemUnlinkSuccess(),
					description: '',
					type: 'success'
				}
			});
		} catch {
			addToast({
				data: {
					title: m.activities_bookingSystemUnlinkError(),
					description: '',
					type: 'error'
				}
			});
		} finally {
			unlinking = false;
		}
	}
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-semibold">{m.activities_bookingSystemSectionTitle()}</h3>
		<p class="text-base-content/60 text-sm">{m.activities_bookingSystemSectionDescription()}</p>
	</div>

	{#if isIndexed && data.indexation}
		<div class="grid max-w-lg gap-4">
			<div class="flex items-center gap-3">
				<span class="text-sm font-medium">{m.activities_bookingSystemStatusLabel()}:</span>
				<div
					aria-label="status"
					class="status status-lg {getStatusClass(data.indexation.status)} mr-1"
				></div>
				<span class="text-sm">{statusLabel}</span>
			</div>

			<div class="grid gap-2">
				<div>
					<span class="text-base-content/60 text-sm">{m.activities_bookingSystemLabel()}</span>
					<p class="font-medium">{bookingSystemLabel}</p>
				</div>
				<div>
					<span class="text-base-content/60 text-sm">{m.activities_bookingSystemIdLabel()}</span>
					<p class="font-medium">{data.indexation.bookingSystemId}</p>
				</div>
				<div>
					<span class="text-base-content/60 text-sm"
						>{m.activities_bookingSystemPriorityLabel()}</span
					>
					<p class="font-medium">{priorityLabel}</p>
				</div>
			</div>

			<div class="mt-2">
				<button
					type="button"
					class="btn btn-error btn-outline"
					onclick={() => unlinkDialog?.showModal()}
				>
					{m.activities_bookingSystemUnlinkButton()}
				</button>
			</div>
		</div>

		<PureHtmlDialog bind:this={unlinkDialog} title={m.activities_bookingSystemUnlinkDialogTitle()}>
			{#snippet content()}
				<p>{m.activities_bookingSystemUnlinkDialogMessage()}</p>
			{/snippet}
			{#snippet actions()}
				<button class="btn" onclick={() => unlinkDialog?.close()}>
					{m.common_cancel()}
				</button>
				<button class="btn btn-error" disabled={unlinking} onclick={handleUnlink}>
					{#if unlinking}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					{m.activities_bookingSystemUnlinkButton()}
				</button>
			{/snippet}
		</PureHtmlDialog>
	{:else}
		<BookingSystemSelector
			optionId={data.option.id}
			optionTitle={data.option.title}
			onSuccess={() =>
				addToast({
					data: {
						title: m.activities_bookingSystemSuccess(),
						description: '',
						type: 'success'
					}
				})}
			onError={() =>
				addToast({
					data: {
						title: m.activities_bookingSystemError(),
						description: '',
						type: 'error'
					}
				})}
		/>
	{/if}
</div>
