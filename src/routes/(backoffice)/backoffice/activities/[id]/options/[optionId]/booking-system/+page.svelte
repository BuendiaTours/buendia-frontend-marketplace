<script lang="ts">
	/**
	 * Booking System tab — shows integration status and supplier option code.
	 * - PENDING / UNNECESSARY: editable form to set supplierOptionCode.
	 * - ACTIVITY_INDEXED / COMPLETED: read-only with unlink action.
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import { getContext } from 'svelte';
	import { ACTIVITY_OPTION_REQUEST } from '$core/activity-options/requests';
	import { OptionIntegrationStatus } from '$core/activity-options/enums';
	import {
		OPTION_BOOKING_SYSTEM_OPTIONS,
		OPTION_INTEGRATION_STATUS_OPTIONS
	} from '$lib/labels/activityOptions';
	import PureHtmlDialog from '$lib/components/backoffice/PureHtmlDialog.svelte';

	let { data }: PageProps = $props();

	const addToast =
		getContext<
			(toast: { data: { title: string; description: string; type: 'success' | 'error' } }) => void
		>('activityToast');

	let supplierOptionCode = $state(data.option.supplierOptionCode ?? '');
	let submitting = $state(false);
	let unlinking = $state(false);
	let unlinkDialog = $state<PureHtmlDialog>();

	const isEditable = $derived(
		data.option.integrationStatus === OptionIntegrationStatus.PENDING ||
			data.option.integrationStatus === OptionIntegrationStatus.UNNECESSARY
	);

	const integrationStatusLabel = $derived(
		OPTION_INTEGRATION_STATUS_OPTIONS.find((o) => o.id === data.option.integrationStatus)?.name ??
			data.option.integrationStatus
	);

	const bookingSystemLabel = $derived(
		OPTION_BOOKING_SYSTEM_OPTIONS.find((o) => o.id === data.option.bookingSystem)?.name ??
			data.option.bookingSystem
	);

	function getStatusClass(status: OptionIntegrationStatus): string {
		switch (status) {
			case OptionIntegrationStatus.COMPLETED:
				return 'status-success';
			case OptionIntegrationStatus.ACTIVITY_INDEXED:
				return 'status-warning';
			case OptionIntegrationStatus.PENDING:
				return 'status-info';
			case OptionIntegrationStatus.UNNECESSARY:
				return 'status-neutral';
			default:
				return 'status-neutral';
		}
	}

	const canSubmit = $derived(supplierOptionCode.trim() !== '' && !submitting);

	async function handleSave() {
		if (!canSubmit) return;

		submitting = true;
		try {
			await ACTIVITY_OPTION_REQUEST.update(fetch, data.option.id, {
				supplierOptionCode: supplierOptionCode.trim()
			});
			addToast({
				data: {
					title: m.activities_integrationSaveSuccess(),
					description: '',
					type: 'success'
				}
			});
		} catch {
			addToast({
				data: {
					title: m.activities_integrationSaveError(),
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
			await ACTIVITY_OPTION_REQUEST.update(fetch, data.option.id, {
				supplierOptionCode: '',
				integrationStatus: OptionIntegrationStatus.PENDING
			});
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
		<p class="text-base-content/60 text-sm">
			{isEditable
				? m.activities_integrationPendingDescription()
				: m.activities_integrationLinkedDescription()}
		</p>
	</div>

	<div class="grid max-w-lg gap-4">
		<div class="flex items-center gap-3">
			<span class="text-sm font-medium">{m.activities_integrationStatusLabel()}:</span>
			<div
				aria-label="status"
				class="status status-lg {getStatusClass(data.option.integrationStatus)} mr-1"
			></div>
			<span class="text-sm">{integrationStatusLabel}</span>
		</div>

		<div>
			<span class="text-base-content/60 text-sm">{m.activities_bookingSystemLabel()}</span>
			<p class="font-medium">{bookingSystemLabel}</p>
		</div>

		{#if isEditable}
			<div class="form-control w-full">
				<label class="label" for="supplierOptionCode">
					<span class="label-text">{m.activities_supplierOptionCodeLabel()}</span>
				</label>
				<input
					id="supplierOptionCode"
					type="text"
					class="input input-bordered w-full"
					placeholder={m.activities_supplierOptionCodePlaceholder()}
					bind:value={supplierOptionCode}
					disabled={submitting}
				/>
			</div>

			<div class="mt-2">
				<button type="button" class="btn btn-primary" disabled={!canSubmit} onclick={handleSave}>
					{#if submitting}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					{m.activities_integrationSaveButton()}
				</button>
			</div>
		{:else}
			<div>
				<span class="text-base-content/60 text-sm">{m.activities_supplierOptionCodeLabel()}</span>
				<p class="font-medium">{data.option.supplierOptionCode ?? '—'}</p>
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

			<PureHtmlDialog
				bind:this={unlinkDialog}
				title={m.activities_bookingSystemUnlinkDialogTitle()}
			>
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
		{/if}
	</div>
</div>
