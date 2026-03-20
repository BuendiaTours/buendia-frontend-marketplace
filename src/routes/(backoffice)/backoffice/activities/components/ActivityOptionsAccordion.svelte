<script lang="ts">
	/**
	 * ActivityOptionsAccordion — Manages activity options as sub-resources.
	 * Each option has a title, language, booking system, privacy, and optional duration/description.
	 * Uses a dialog for creation and direct API calls via ACTIVITY_OPTION_REQUEST.
	 */
	import * as m from '$paraglide/messages';
	import { v4 as uuidv4 } from 'uuid';
	import { Add, Close, Tuning } from '$lib/icons/Linear';
	import { ACTIVITY_ROUTES } from '$lib/config/routes/backoffice/activities';
	import {
		OptionBookingSystem,
		OptionDurationUnit,
		OptionLanguage,
		OptionPrivacy
	} from '$core/activity-options/enums';
	import { ACTIVITY_OPTION_REQUEST } from '$core/activity-options/requests';
	import type { ActivityOption } from '$core/activity-options/types';
	import { showConfirmDialog } from '$lib/actions/backoffice/confirmAction';
	import {
		OPTION_BOOKING_SYSTEM_OPTIONS,
		OPTION_DURATION_UNIT_OPTIONS,
		OPTION_LANGUAGE_OPTIONS,
		OPTION_PRIVACY_OPTIONS,
		OPTION_STATUS_OPTIONS
	} from '$lib/labels/activityOptions';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import PureHtmlDialog from '$lib/components/backoffice/PureHtmlDialog.svelte';

	type ToastFn = (data: {
		data: { title: string; description: string; type: 'success' | 'error' };
	}) => void;

	type Props = {
		activityId: string;
		options: ActivityOption[];
		addToast?: ToastFn;
	};

	let { activityId, options = $bindable(), addToast }: Props = $props();

	let dialog: PureHtmlDialog;
	let selectedTitle = $state('');
	let selectedLanguage = $state<OptionLanguage>(OptionLanguage.ES);
	let selectedBookingSystem = $state<OptionBookingSystem>(OptionBookingSystem.BOKUN);
	let selectedPrivacy = $state<OptionPrivacy>(OptionPrivacy.PUBLIC);
	let selectedDescription = $state('');
	let selectedDurationQuantity = $state<number>(1);
	let selectedDurationUnit = $state<OptionDurationUnit>(OptionDurationUnit.HOURS);
	let isAdding = $state(false);
	let isRemoving = $state<string | null>(null);

	function showToast(type: 'success' | 'error', description: string) {
		addToast?.({ data: { title: type === 'success' ? 'Success' : 'Error', description, type } });
	}

	function resetForm() {
		selectedTitle = '';
		selectedLanguage = OptionLanguage.ES;
		selectedBookingSystem = OptionBookingSystem.BOKUN;
		selectedPrivacy = OptionPrivacy.PUBLIC;
		selectedDescription = '';
		selectedDurationQuantity = 1;
		selectedDurationUnit = OptionDurationUnit.HOURS;
	}

	function openCreateDialog() {
		resetForm();
		dialog.showModal();
	}

	async function handleAdd() {
		if (!selectedTitle.trim()) return;

		isAdding = true;
		try {
			const optionId = uuidv4();
			const duration = { unit: selectedDurationUnit, quantity: selectedDurationQuantity };

			await ACTIVITY_OPTION_REQUEST.create(globalThis.fetch, {
				id: optionId,
				activityId,
				title: selectedTitle.trim(),
				language: selectedLanguage,
				bookingSystem: selectedBookingSystem,
				privacy: selectedPrivacy,
				duration,
				...(selectedDescription.trim() ? { description: selectedDescription.trim() } : {})
			});

			options = [
				...options,
				{
					id: optionId,
					activityId,
					title: selectedTitle.trim(),
					language: selectedLanguage,
					bookingSystem: selectedBookingSystem,
					privacy: selectedPrivacy,
					duration,
					description: selectedDescription.trim() || null,
					audios: [],
					availabilityGroupId: null,
					brochures: [],
					groupTickets: [],
					individualTickets: [],
					liveGuides: [],
					maxGroupSize: null,
					maxTicketsPerIndividual: null,
					pickup: null,
					skipTheLineType: null,
					status: 'DRAFT' as ActivityOption['status'],
					supplierOptionCode: null,
					ticketKind: null,
					wheelchair: 'NOT_ACCESSIBLE' as ActivityOption['wheelchair'],
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				}
			];

			dialog.close();
			showToast('success', m.activities_optionsAdded());
		} catch (err) {
			console.error('Error adding option:', err);
			showToast('error', m.activities_optionsError());
		} finally {
			isAdding = false;
		}
	}

	async function handleRemove(option: ActivityOption) {
		const confirmed = await showConfirmDialog({
			title: m.activities_confirmDeleteTitle(),
			message: m.activities_confirmDeleteMessage(),
			confirmText: m.common_delete(),
			cancelText: m.common_cancel(),
			danger: true
		});
		if (!confirmed) return;

		isRemoving = option.id;
		try {
			await ACTIVITY_OPTION_REQUEST.update(globalThis.fetch, option.id, {
				status: 'DELETED' as ActivityOption['status']
			});
			options = options.filter((o) => o.id !== option.id);
			showToast('success', m.activities_optionsRemoved());
		} catch (err) {
			console.error('Error removing option:', err);
			showToast('error', m.activities_optionsError());
		} finally {
			isRemoving = null;
		}
	}

	function getOptionLabel(option: ActivityOption): string {
		const lang = OPTION_LANGUAGE_OPTIONS.find((o) => o.id === option.language)?.name ?? '';
		return `${option.title} (${lang})`;
	}

	function getOptionTags(option: ActivityOption): string[] {
		const tags: string[] = [];
		const status = OPTION_STATUS_OPTIONS.find((o) => o.id === option.status);
		if (status) tags.push(status.name);
		const privacy = OPTION_PRIVACY_OPTIONS.find((o) => o.id === option.privacy);
		if (privacy) tags.push(privacy.name);
		const booking = OPTION_BOOKING_SYSTEM_OPTIONS.find((o) => o.id === option.bookingSystem);
		if (booking) tags.push(booking.name);
		if (option.duration) {
			const unit =
				OPTION_DURATION_UNIT_OPTIONS.find((o) => o.id === option.duration.unit)?.name ?? '';
			tags.push(`${option.duration.quantity} ${unit}`);
		}
		return tags;
	}
</script>

<FormAccordion name="form-activity-options" open>
	{#snippet title()}
		<Tuning class="size-6" />
		<span>{m.activities_sectionOptions()}</span>
	{/snippet}
	{#snippet asideContent()}
		<p class="text-xs">{m.activities_sectionOptionsDescription()}</p>
	{/snippet}
	{#snippet content()}
		<div class="text-right md:col-span-12">
			<button type="button" class="btn btn-outline btn-primary btn-sm" onclick={openCreateDialog}>
				<Add class="size-4" />
				{m.activities_optionsNewButton()}
			</button>
		</div>

		<div class="md:col-span-12">
			{#if options.length === 0}
				<div class="flex flex-col items-center gap-2 py-8">
					<Tuning class="text-base-content/20 size-10" />
					<p class="text-base-content/50 text-sm">{m.activities_optionsEmpty()}</p>
				</div>
			{:else}
				<div class="space-y-2">
					{#each options as option (option.id)}
						<div
							class="border-neutral bg-base-200/50 flex items-center gap-3 rounded-lg border-l-4 px-3 py-2.5"
						>
							<Tuning class="text-base-content/40 size-5 shrink-0" />
							<div class="min-w-0 flex-1">
								<a
									href={ACTIVITY_ROUTES.optionEdit(activityId, option.id)}
									class="font-medium hover:underline"
								>
									{getOptionLabel(option)}
								</a>
								<p class="text-base-content/50 mt-0.5 text-xs">
									{getOptionTags(option).join(' · ')}
								</p>
							</div>
							<button
								type="button"
								class="btn btn-ghost btn-xs text-error hover:bg-error/10"
								disabled={isRemoving === option.id}
								onclick={() => handleRemove(option)}
							>
								{#if isRemoving === option.id}
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

<!-- Create option dialog -->
<PureHtmlDialog bind:this={dialog} title={m.activities_optionsDialogTitle()}>
	{#snippet content()}
		<div class="space-y-4">
			<div class="form-control">
				<label class="label text-sm" for="dialogOptionTitle">
					<span>{m.activities_optionsTitleLabel()}</span>
				</label>
				<input
					id="dialogOptionTitle"
					type="text"
					class="input w-full"
					placeholder={m.activities_optionsTitlePlaceholder()}
					bind:value={selectedTitle}
				/>
			</div>

			<div class="grid grid-cols-3 gap-4">
				<div class="form-control">
					<label class="label text-sm" for="dialogOptionLanguage">
						<span>{m.activities_optionsLanguageLabel()}</span>
					</label>
					<select id="dialogOptionLanguage" class="select w-full" bind:value={selectedLanguage}>
						{#each OPTION_LANGUAGE_OPTIONS as opt (opt.id)}
							<option value={opt.id}>{opt.name}</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label class="label text-sm" for="dialogOptionBookingSystem">
						<span>{m.activities_optionsBookingSystemLabel()}</span>
					</label>
					<select
						id="dialogOptionBookingSystem"
						class="select w-full"
						bind:value={selectedBookingSystem}
					>
						{#each OPTION_BOOKING_SYSTEM_OPTIONS as opt (opt.id)}
							<option value={opt.id}>{opt.name}</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label class="label text-sm" for="dialogOptionPrivacy">
						<span>{m.activities_optionsPrivacyLabel()}</span>
					</label>
					<select id="dialogOptionPrivacy" class="select w-full" bind:value={selectedPrivacy}>
						{#each OPTION_PRIVACY_OPTIONS as opt (opt.id)}
							<option value={opt.id}>{opt.name}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="form-control">
					<label class="label text-sm" for="dialogOptionDurationQty">
						<span>{m.activities_optionsDurationLabel()}</span>
					</label>
					<input
						id="dialogOptionDurationQty"
						type="number"
						class="input w-full"
						min="1"
						bind:value={selectedDurationQuantity}
					/>
				</div>

				<div class="form-control">
					<label class="label text-sm" for="dialogOptionDurationUnit">
						<span>{m.activities_optionsDurationUnitLabel()}</span>
					</label>
					<select
						id="dialogOptionDurationUnit"
						class="select w-full"
						bind:value={selectedDurationUnit}
					>
						{#each OPTION_DURATION_UNIT_OPTIONS as opt (opt.id)}
							<option value={opt.id}>{opt.name}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="form-control">
				<label class="label text-sm" for="dialogOptionDescription">
					<span>{m.activities_optionsDescriptionLabel()}</span>
				</label>
				<textarea
					id="dialogOptionDescription"
					class="textarea w-full"
					rows={3}
					placeholder={m.activities_optionsDescriptionPlaceholder()}
					bind:value={selectedDescription}
				></textarea>
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
			disabled={!selectedTitle.trim() || isAdding}
			onclick={handleAdd}
		>
			{#if isAdding}
				<span class="loading loading-spinner loading-xs"></span>
			{/if}
			{m.activities_optionsCreateButton()}
		</button>
	{/snippet}
</PureHtmlDialog>
