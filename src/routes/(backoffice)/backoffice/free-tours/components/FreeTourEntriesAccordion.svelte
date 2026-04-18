<script lang="ts">
	/**
	 * FreeTourEntriesAccordion — Manages free tour ↔ activity relationships with priority.
	 * Entries can be multiple (N activities per aggregation). The 1:1 invariant is at the
	 * activity↔aggregation level: each FREE_TOUR activity belongs to at most one aggregation.
	 * The async search shows only FREE_TOUR activities that are not yet linked anywhere.
	 */
	import * as m from '$paraglide/messages';
	import { ChecklistMinimalistic, Close, Pen } from '$lib/icons/Linear';
	import { FREE_TOUR_REQUEST } from '$core/free-tours/requests';
	import type { FreeTourEntry } from '$core/free-tours/types';
	import { ACTIVITY_ROUTES } from '$lib/config/routes/backoffice/activities';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormAsyncSearch from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
	import { searchFreeTourActivities } from '../queries/activity-search.queries';
	import { showConfirmDialog } from '$lib/actions/backoffice/confirmAction';

	type ToastFn = (data: {
		data: { title: string; description: string; type: 'success' | 'error' };
	}) => void;

	type Props = {
		freeTourId: string;
		entries: FreeTourEntry[];
		/** Pre-loaded activities to resolve activityId → title. */
		availableActivities: { id: string; title: string }[];
		addToast?: ToastFn;
	};

	let { freeTourId, entries = $bindable(), availableActivities, addToast }: Props = $props();

	let searchValue = $state<string | undefined>(undefined);
	let isRemoving = $state<string | null>(null);
	let isMoving = $state<string | null>(null);

	const sortedEntries = $derived([...entries].sort((a, b) => a.priority - b.priority));

	function showToast(type: 'success' | 'error', description: string) {
		addToast?.({ data: { title: type === 'success' ? 'Success' : 'Error', description, type } });
	}

	function getActivityTitle(activityId: string): string {
		return availableActivities.find((a) => a.id === activityId)?.title ?? activityId;
	}

	/** Auto-add when an activity is selected from async search. */
	$effect(() => {
		if (searchValue) {
			handleAdd(searchValue);
			searchValue = undefined;
		}
	});

	async function handleAdd(activityId: string) {
		if (!activityId) return;

		const alreadyLinked = entries.some((e) => e.activityId === activityId);
		if (alreadyLinked) return;

		try {
			const entryId = crypto.randomUUID();
			const nextPriority =
				entries.length === 0 ? 1 : Math.max(...entries.map((e) => e.priority)) + 1;

			await FREE_TOUR_REQUEST.addEntry(fetch, freeTourId, {
				id: entryId,
				activityId,
				priority: nextPriority
			});

			entries = [...entries, { id: entryId, activityId, priority: nextPriority }];
			showToast('success', m.freeTours_entriesAdded());
		} catch (err) {
			console.error('Error adding entry:', err);
			showToast('error', m.freeTours_entriesError());
		}
	}

	async function handleRemove(entry: FreeTourEntry) {
		const confirmed = await showConfirmDialog({
			title: m.freeTours_confirmRemoveTitle(),
			message: m.freeTours_confirmRemoveMessage(),
			confirmText: m.common_delete(),
			cancelText: m.common_cancel(),
			danger: true
		});
		if (!confirmed) return;

		isRemoving = entry.id;
		try {
			await FREE_TOUR_REQUEST.removeEntry(fetch, freeTourId, entry.id);
			entries = entries.filter((e) => e.id !== entry.id);
			showToast('success', m.freeTours_entriesRemoved());
		} catch (err) {
			console.error('Error removing entry:', err);
			showToast('error', m.freeTours_entriesError());
		} finally {
			isRemoving = null;
		}
	}

	async function handleMove(entry: FreeTourEntry, direction: 'up' | 'down') {
		const sorted = [...entries].sort((a, b) => a.priority - b.priority);
		const idx = sorted.findIndex((e) => e.id === entry.id);
		const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
		if (swapIdx < 0 || swapIdx >= sorted.length) return;

		isMoving = entry.id;
		const previousEntries = entries;

		const reordered = [...sorted];
		[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];
		// Reassign priorities and generate new IDs (backend rejects re-add with same activityId due to CQRS)
		const withNewPriorities = reordered.map((e, i) => ({
			...e,
			id: crypto.randomUUID(),
			priority: i + 1
		}));
		entries = withNewPriorities;

		try {
			for (const e of previousEntries) {
				await FREE_TOUR_REQUEST.removeEntry(fetch, freeTourId, e.id);
			}
			for (const e of withNewPriorities) {
				await FREE_TOUR_REQUEST.addEntry(fetch, freeTourId, {
					id: e.id,
					activityId: e.activityId,
					priority: e.priority
				});
			}
		} catch (err) {
			console.error('Error reordering entries:', err);
			entries = previousEntries;
			showToast('error', m.freeTours_entriesError());
		} finally {
			isMoving = null;
		}
	}
</script>

<FormAccordion name="form-free-tour-entries" open>
	{#snippet title()}
		<ChecklistMinimalistic class="size-6" />
		<span>{m.freeTours_sectionEntries()}</span>
	{/snippet}
	{#snippet asideContent()}
		<p class="text-xs">{m.freeTours_sectionEntriesDescription()}</p>
	{/snippet}
	{#snippet content()}
		<div class="md:col-span-12">
			<FormAsyncSearch
				id="entry-search"
				label={m.freeTours_labelActivity()}
				placeholder={m.freeTours_placeholderActivity()}
				bind:value={searchValue}
				searchFn={searchFreeTourActivities}
			/>
		</div>

		<div class="md:col-span-12">
			{#if entries.length === 0}
				<div class="flex flex-col items-center gap-2 py-8">
					<ChecklistMinimalistic class="text-base-content/20 size-10" />
					<p class="text-base-content/50 text-sm">{m.freeTours_entriesEmpty()}</p>
				</div>
			{:else}
				<div class="mt-2 space-y-2">
					{#each sortedEntries as entry, idx (entry.id)}
						<div
							class="border-neutral bg-base-200/50 flex items-center gap-3 rounded-lg border-l-4 px-3 py-2.5"
						>
							<span class="badge badge-neutral badge-sm font-mono">{idx + 1}</span>
							<span class="min-w-0 flex-1 font-medium">
								{getActivityTitle(entry.activityId)}
							</span>
							<button
								type="button"
								class="btn btn-ghost btn-xs"
								disabled={idx === 0 || isMoving !== null}
								onclick={() => handleMove(entry, 'up')}
							>
								&#8593;
							</button>
							<button
								type="button"
								class="btn btn-ghost btn-xs"
								disabled={idx === sortedEntries.length - 1 || isMoving !== null}
								onclick={() => handleMove(entry, 'down')}
							>
								&#8595;
							</button>
							<a
								href={`${ACTIVITY_ROUTES.edit(entry.activityId)}?from=${freeTourId}`}
								class="btn btn-ghost btn-xs"
								title={m.freeTours_entriesEditActivity()}
								aria-label={m.freeTours_entriesEditActivity()}
							>
								<Pen class="size-4" />
							</a>
							<button
								type="button"
								class="btn btn-ghost btn-xs text-error hover:bg-error/10"
								disabled={isRemoving === entry.id}
								onclick={() => handleRemove(entry)}
							>
								{#if isRemoving === entry.id}
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
