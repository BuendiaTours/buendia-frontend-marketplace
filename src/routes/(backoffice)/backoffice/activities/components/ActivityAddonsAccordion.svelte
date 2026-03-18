<script lang="ts">
	/**
	 * ActivityAddonsAccordion — Manages activity addons as sub-resources.
	 * Each addon has a name, base price, and optional max per booking.
	 * Uses a dialog for creation and direct API calls via ACTIVITY_ADDON_REQUEST.
	 * Prices are stored in cents (API) and displayed/entered in euros (UI).
	 */
	import * as m from '$paraglide/messages';
	import { v4 as uuidv4 } from 'uuid';
	import { Add, Close, Widget } from '$lib/icons/Linear';
	import { ACTIVITY_ADDON_REQUEST } from '$core/activity-addons/requests';
	import type { ActivityAddon } from '$core/activity-addons/types';
	import { showConfirmDialog } from '$lib/actions/backoffice/confirmAction';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import PureHtmlDialog from '$lib/components/backoffice/PureHtmlDialog.svelte';

	type ToastFn = (data: {
		data: { title: string; description: string; type: 'success' | 'error' };
	}) => void;

	type Props = {
		activityId: string;
		addons: ActivityAddon[];
		addToast?: ToastFn;
	};

	let { activityId, addons = $bindable(), addToast }: Props = $props();

	let dialog: PureHtmlDialog;
	let addonName = $state('');
	let addonBasePriceEuros = $state<number>(0);
	let addonMaxPerBooking = $state<number | undefined>(undefined);
	let isAdding = $state(false);
	let isRemoving = $state<string | null>(null);

	function showToast(type: 'success' | 'error', description: string) {
		addToast?.({ data: { title: type === 'success' ? 'Success' : 'Error', description, type } });
	}

	/** Converts euros (UI) to cents (API). */
	function eurosToCents(euros: number): number {
		return Math.round(euros * 100);
	}

	/** Converts cents (API) to euros (UI). */
	function centsToEuros(cents: number): number {
		return cents / 100;
	}

	function resetForm() {
		addonName = '';
		addonBasePriceEuros = 0;
		addonMaxPerBooking = undefined;
	}

	function openCreateDialog() {
		resetForm();
		dialog.showModal();
	}

	async function handleAdd() {
		if (!addonName.trim()) return;

		isAdding = true;
		try {
			const addonId = uuidv4();
			const basePriceCents = eurosToCents(addonBasePriceEuros);
			await ACTIVITY_ADDON_REQUEST.create(fetch, {
				id: addonId,
				activityId,
				name: addonName.trim(),
				basePrice: basePriceCents,
				maxPerBooking: addonMaxPerBooking
			});

			addons = [
				...addons,
				{
					id: addonId,
					activityId,
					activityOptions: [],
					name: addonName.trim(),
					basePrice: basePriceCents,
					maxPerBooking: addonMaxPerBooking ?? null,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				}
			];

			dialog.close();
			showToast('success', m.activities_addonsAdded());
		} catch (err) {
			console.error('Error adding addon:', err);
			showToast('error', m.activities_addonsError());
		} finally {
			isAdding = false;
		}
	}

	async function handleRemove(addon: ActivityAddon) {
		const confirmed = await showConfirmDialog({
			title: m.activities_confirmDeleteTitle(),
			message: m.activities_confirmDeleteMessage(),
			confirmText: m.common_delete(),
			cancelText: m.common_cancel(),
			danger: true
		});
		if (!confirmed) return;

		isRemoving = addon.id;
		try {
			await ACTIVITY_ADDON_REQUEST.delete(fetch, addon.id);
			addons = addons.filter((a) => a.id !== addon.id);
			showToast('success', m.activities_addonsRemoved());
		} catch (err) {
			console.error('Error removing addon:', err);
			showToast('error', m.activities_addonsError());
		} finally {
			isRemoving = null;
		}
	}

	function formatPrice(priceCents: number): string {
		return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
			centsToEuros(priceCents)
		);
	}
</script>

<FormAccordion name="form-activity-addons" open>
	{#snippet title()}
		<Widget class="size-6" />
		<span>{m.activities_sectionAddons()}</span>
	{/snippet}
	{#snippet asideContent()}
		<p class="text-xs">{m.activities_sectionAddonsDescription()}</p>
	{/snippet}
	{#snippet content()}
		<div class="md:col-span-12">
			<button type="button" class="btn btn-outline btn-primary btn-sm" onclick={openCreateDialog}>
				<Add class="size-4" />
				{m.activities_addonsAddButton()}
			</button>
		</div>

		<!-- Addons list -->
		<div class="md:col-span-12">
			{#if addons.length === 0}
				<p class="text-base-content/50 py-4 text-center text-sm">
					{m.activities_addonsEmpty()}
				</p>
			{:else}
				<div class="space-y-2">
					{#each addons as addon (addon.id)}
						<div class="bg-base-200/50 flex items-center justify-between rounded-lg px-3 py-2">
							<div class="flex items-center gap-3">
								<span class="font-medium">{addon.name}</span>
								<span class="badge badge-ghost badge-sm">{formatPrice(addon.basePrice)}</span>
								{#if addon.maxPerBooking !== null}
									<span class="badge badge-outline badge-sm">
										{m.activities_addonsMaxLabel({ max: addon.maxPerBooking })}
									</span>
								{/if}
							</div>
							<button
								type="button"
								class="btn btn-ghost btn-xs text-error hover:bg-error/10"
								disabled={isRemoving === addon.id}
								onclick={() => handleRemove(addon)}
							>
								{#if isRemoving === addon.id}
									<span class="loading loading-spinner loading-xs"></span>
								{:else}
									<Close class="size-4" />
								{/if}
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/snippet}
</FormAccordion>

<!-- Create addon dialog -->
<PureHtmlDialog bind:this={dialog} title={m.activities_addonsDialogTitle()}>
	{#snippet content()}
		<div class="space-y-4">
			<div class="form-control">
				<label class="label text-sm" for="dialogAddonName">
					<span>{m.activities_addonsNameLabel()}</span>
				</label>
				<input
					id="dialogAddonName"
					type="text"
					class="input w-full"
					placeholder={m.activities_addonsNamePlaceholder()}
					bind:value={addonName}
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="form-control">
					<label class="label text-sm" for="dialogAddonBasePrice">
						<span>{m.activities_addonsBasePriceLabel()}</span>
					</label>
					<input
						id="dialogAddonBasePrice"
						type="number"
						class="input w-full"
						min="0"
						step="0.01"
						bind:value={addonBasePriceEuros}
					/>
				</div>

				<div class="form-control">
					<label class="label text-sm" for="dialogAddonMaxPerBooking">
						<span>{m.activities_addonsMaxPerBookingLabel()}</span>
					</label>
					<input
						id="dialogAddonMaxPerBooking"
						type="number"
						class="input w-full"
						min="1"
						step="1"
						placeholder="—"
						bind:value={addonMaxPerBooking}
					/>
				</div>
			</div>
		</div>
	{/snippet}
	{#snippet actions()}
		<button type="button" class="btn btn-ghost" onclick={() => dialog.close()}>
			{m.common_cancel()}
		</button>
		<button
			type="button"
			class="btn btn-primary"
			disabled={!addonName.trim() || isAdding}
			onclick={handleAdd}
		>
			{#if isAdding}
				<span class="loading loading-spinner loading-xs"></span>
			{/if}
			{m.activities_addonsCreateButton()}
		</button>
	{/snippet}
</PureHtmlDialog>
