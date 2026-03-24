<script lang="ts">
	/**
	 * ActivityOptionsAccordion — Manages activity options as sub-resources.
	 * Each option has a title, language, booking system, privacy, and optional duration/description.
	 * Creation is handled via a dedicated page; deletion via client-side API calls.
	 */
	import * as m from '$paraglide/messages';
	import { Add, Close, Tuning } from '$lib/icons/Linear';
	import { ACTIVITY_ROUTES } from '$lib/config/routes/backoffice/activities';
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

	type ToastFn = (data: {
		data: { title: string; description: string; type: 'success' | 'error' };
	}) => void;

	type Props = {
		activityId: string;
		options: ActivityOption[];
		addToast?: ToastFn;
	};

	let { activityId, options = $bindable(), addToast }: Props = $props();

	let isRemoving = $state<string | null>(null);

	function showToast(type: 'success' | 'error', description: string) {
		addToast?.({ data: { title: type === 'success' ? 'Success' : 'Error', description, type } });
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
			<a href={ACTIVITY_ROUTES.optionCreate(activityId)} class="btn btn-outline btn-primary btn-sm">
				<Add class="size-4" />
				{m.activities_optionsNewButton()}
			</a>
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
