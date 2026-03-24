<script lang="ts">
	/**
	 * Booking System tab — indexes an option in an external booking system.
	 * If already indexed, shows read-only data with status and an unlink action.
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import { getContext } from 'svelte';
	import { ACTIVITY_REQUEST } from '$core/activities/requests';
	import type { BookingSystem } from '$core/bookings/enums';
	import type { ActivityIndexationPriority } from '$core/activities/enums';
	import {
		BOOKING_SYSTEM_OPTIONS,
		CORE_ACTIVITY_STATUS_OPTIONS,
		INDEXATION_PRIORITY_OPTIONS
	} from '$lib/labels/bookings';
	import PureHtmlDialog from '$lib/components/backoffice/PureHtmlDialog.svelte';

	let { data }: PageProps = $props();

	const addToast =
		getContext<
			(toast: { data: { title: string; description: string; type: 'success' | 'error' } }) => void
		>('activityToast');

	let bookingSystem = $state<BookingSystem | ''>('');
	let bookingSystemId = $state('');
	let priority = $state<ActivityIndexationPriority | ''>('');
	let submitting = $state(false);
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

	const canSubmit = $derived(
		bookingSystem !== '' && bookingSystemId.trim() !== '' && priority !== ''
	);

	async function handleSubmit() {
		if (!canSubmit || submitting) return;

		submitting = true;
		try {
			await ACTIVITY_REQUEST.indexActivity(fetch, {
				bookingSystem: bookingSystem as BookingSystem,
				bookingSystemId: bookingSystemId.trim(),
				coreId: data.option.id,
				coreTitle: data.option.title,
				priority: priority as ActivityIndexationPriority
			});
			addToast({
				data: {
					title: m.activities_bookingSystemSuccess(),
					description: '',
					type: 'success'
				}
			});
		} catch {
			addToast({
				data: {
					title: m.activities_bookingSystemError(),
					description: '',
					type: 'error'
				}
			});
		} finally {
			submitting = false;
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
		<div class="grid max-w-lg gap-4">
			<div class="form-control w-full">
				<label class="label" for="bookingSystem">
					<span class="label-text">{m.activities_bookingSystemLabel()}</span>
				</label>
				<select id="bookingSystem" class="select select-bordered w-full" bind:value={bookingSystem}>
					<option value="" disabled>{m.activities_bookingSystemPlaceholder()}</option>
					{#each BOOKING_SYSTEM_OPTIONS as option (option.id)}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
			</div>

			<div class="form-control w-full">
				<label class="label" for="bookingSystemId">
					<span class="label-text">{m.activities_bookingSystemIdLabel()}</span>
				</label>
				<input
					id="bookingSystemId"
					type="text"
					class="input input-bordered w-full"
					placeholder={m.activities_bookingSystemIdPlaceholder()}
					bind:value={bookingSystemId}
				/>
			</div>

			<div class="form-control w-full">
				<label class="label" for="priority">
					<span class="label-text">{m.activities_bookingSystemPriorityLabel()}</span>
				</label>
				<select id="priority" class="select select-bordered w-full" bind:value={priority}>
					<option value="" disabled>{m.activities_bookingSystemPriorityPlaceholder()}</option>
					{#each INDEXATION_PRIORITY_OPTIONS as option (option.id)}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
			</div>

			<div class="mt-2">
				<button
					type="button"
					class="btn btn-primary"
					disabled={!canSubmit || submitting}
					onclick={handleSubmit}
				>
					{#if submitting}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					{m.activities_bookingSystemSubmitButton()}
				</button>
			</div>
		</div>
	{/if}
</div>
