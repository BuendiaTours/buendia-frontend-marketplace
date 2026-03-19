<script lang="ts">
	/**
	 * ActivityStagesAccordion — Manages activity itinerary stages as sub-resources.
	 * Each stage has a kind (transfer/experience), duration, relevance, requirement,
	 * and optional name/description. Uses a dialog for creation and direct API calls.
	 */
	import * as m from '$paraglide/messages';
	import { v4 as uuidv4 } from 'uuid';
	import {
		Add,
		AltArrowDown,
		AltArrowUp,
		Close,
		Map as MapIcon,
		MapPoint
	} from '$lib/icons/Linear';
	import { StageKind, StageRelevance, StageRequirement } from '$core/activities/enums';
	import { ACTIVITY_REQUEST } from '$core/activities/requests';
	import { showConfirmDialog } from '$lib/actions/backoffice/confirmAction';
	import type { ActivityStage } from '$core/activities/types';
	import {
		STAGE_KIND_OPTIONS,
		STAGE_RELEVANCE_OPTIONS,
		STAGE_REQUIREMENT_OPTIONS
	} from '$lib/labels/activities';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormGeoJson from '$lib/components/backoffice/forms/FormGeoJson.svelte';
	import PureHtmlDialog from '$lib/components/backoffice/PureHtmlDialog.svelte';
	import type { GeoJsonPoint } from '$lib/utils/googleMapsTypes';

	type ToastFn = (data: {
		data: { title: string; description: string; type: 'success' | 'error' };
	}) => void;

	type Props = {
		activityId: string;
		stages: ActivityStage[];
		addToast?: ToastFn;
	};

	let { activityId, stages = $bindable(), addToast }: Props = $props();

	let dialog: PureHtmlDialog;
	let selectedName = $state('');
	let selectedKind = $state<StageKind>(StageKind.EXPERIENCE);
	let selectedDuration = $state(30);
	let selectedRelevance = $state<StageRelevance>(StageRelevance.MEDIUM);
	let selectedRequirement = $state<StageRequirement>(StageRequirement.REQUIRED);
	let selectedDescription = $state('');
	let selectedCoords = $state<GeoJsonPoint | null>(null);
	let isAdding = $state(false);
	let isRemoving = $state<string | null>(null);
	let isMoving = $state<string | null>(null);

	function showToast(type: 'success' | 'error', description: string) {
		addToast?.({ data: { title: type === 'success' ? 'Success' : 'Error', description, type } });
	}

	function resetForm() {
		selectedName = '';
		selectedKind = StageKind.EXPERIENCE;
		selectedDuration = 30;
		selectedRelevance = StageRelevance.MEDIUM;
		selectedRequirement = StageRequirement.REQUIRED;
		selectedDescription = '';
		selectedCoords = null;
	}

	function openCreateDialog() {
		resetForm();
		dialog.showModal();
	}

	async function handleAdd() {
		if (selectedDuration <= 0) return;

		isAdding = true;
		try {
			const stageId = uuidv4();
			const nextOrder = stages.length > 0 ? Math.max(...stages.map((s) => s.order)) + 1 : 1;

			const coords =
				selectedKind === StageKind.EXPERIENCE && selectedCoords
					? {
							latitude: selectedCoords.coordinates[1],
							longitude: selectedCoords.coordinates[0]
						}
					: undefined;

			await ACTIVITY_REQUEST.addStage(globalThis.fetch, activityId, {
				id: stageId,
				kind: selectedKind,
				duration: selectedDuration,
				order: nextOrder,
				relevance: selectedRelevance,
				requirement: selectedRequirement,
				...(selectedName.trim() ? { name: selectedName.trim() } : {}),
				...(selectedDescription.trim() ? { description: selectedDescription.trim() } : {}),
				...(coords ? { coords } : {})
			});

			stages = [
				...stages,
				{
					id: stageId,
					kind: selectedKind,
					duration: selectedDuration,
					order: nextOrder,
					relevance: selectedRelevance,
					requirement: selectedRequirement,
					name: selectedName.trim() || null,
					description: selectedDescription.trim() || null,
					coords: coords ?? null
				}
			];

			dialog.close();
			showToast('success', m.activities_stagesAdded());
		} catch (err) {
			console.error('Error adding stage:', err);
			showToast('error', m.activities_stagesError());
		} finally {
			isAdding = false;
		}
	}

	async function handleRemove(stage: ActivityStage) {
		const confirmed = await showConfirmDialog({
			title: m.activities_confirmDeleteTitle(),
			message: m.activities_confirmDeleteMessage(),
			confirmText: m.common_delete(),
			cancelText: m.common_cancel(),
			danger: true
		});
		if (!confirmed) return;

		isRemoving = stage.id;
		try {
			await ACTIVITY_REQUEST.removeStage(globalThis.fetch, activityId, stage.id);
			stages = stages.filter((s) => s.id !== stage.id);
			showToast('success', m.activities_stagesRemoved());
		} catch (err) {
			console.error('Error removing stage:', err);
			showToast('error', m.activities_stagesError());
		} finally {
			isRemoving = null;
		}
	}

	async function handleMove(stage: ActivityStage, direction: 'up' | 'down') {
		const sorted = [...stages].sort((a, b) => a.order - b.order);
		const idx = sorted.findIndex((s) => s.id === stage.id);
		const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
		if (swapIdx < 0 || swapIdx >= sorted.length) return;

		isMoving = stage.id;

		// Build the new ID order by swapping positions in the sorted array
		const reordered = [...sorted];
		[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];
		const stageIds = reordered.map((s) => s.id);

		// Optimistic: reassign orders based on new positions (1-based)
		const previousStages = stages;
		const orderMap = new Map(stageIds.map((id, i) => [id, i + 1]));
		stages = stages.map((s) => ({ ...s, order: orderMap.get(s.id) ?? s.order }));

		try {
			await ACTIVITY_REQUEST.reorderStages(globalThis.fetch, activityId, { stageIds });
		} catch (err) {
			console.error('Error moving stage:', err);
			stages = previousStages;
			showToast('error', m.activities_stagesMoveError());
		} finally {
			isMoving = null;
		}
	}

	function getStageLabel(stage: ActivityStage): string {
		const kind = STAGE_KIND_OPTIONS.find((o) => o.id === stage.kind)?.name ?? stage.kind;
		return stage.name ? `${stage.name} — ${kind}` : kind;
	}

	function getStageTags(stage: ActivityStage): string[] {
		const tags: string[] = [];
		const relevance = STAGE_RELEVANCE_OPTIONS.find((o) => o.id === stage.relevance);
		if (relevance && stage.relevance !== StageRelevance.NONE) tags.push(relevance.name);
		const requirement = STAGE_REQUIREMENT_OPTIONS.find((o) => o.id === stage.requirement);
		if (requirement && stage.requirement !== StageRequirement.NONE) tags.push(requirement.name);
		return tags;
	}

	const sortedStages = $derived([...stages].sort((a, b) => a.order - b.order));
</script>

<FormAccordion name="form-activity-stages" open>
	{#snippet title()}
		<MapIcon class="size-6" />
		<span>{m.activities_sectionStages()}</span>
	{/snippet}
	{#snippet asideContent()}
		<p class="text-xs">{m.activities_sectionStagesDescription()}</p>
	{/snippet}
	{#snippet content()}
		<div class="text-right md:col-span-12">
			<button type="button" class="btn btn-outline btn-primary btn-sm" onclick={openCreateDialog}>
				<Add class="size-4" />
				{m.activities_stagesNewButton()}
			</button>
		</div>

		<div class="md:col-span-12">
			{#if stages.length === 0}
				<div class="flex flex-col items-center gap-2 py-8">
					<MapIcon class="text-base-content/20 size-10" />
					<p class="text-base-content/50 text-sm">{m.activities_stagesEmpty()}</p>
				</div>
			{:else}
				<div class="space-y-2">
					{#each sortedStages as stage, idx (stage.id)}
						<div
							class="border-neutral bg-base-200/50 flex items-center gap-3 rounded-lg border-l-4 px-3 py-2.5"
							class:opacity-50={isMoving === stage.id}
						>
							<div class="flex shrink-0 flex-col">
								<button
									type="button"
									class="btn btn-ghost btn-xs size-5 min-h-0 p-0"
									disabled={idx === 0 || isMoving !== null}
									onclick={() => handleMove(stage, 'up')}
								>
									<AltArrowUp class="size-3.5" />
								</button>
								<span
									class="bg-base-content/10 flex size-7 items-center justify-center rounded-full text-xs font-bold"
								>
									{stage.order}
								</span>
								<button
									type="button"
									class="btn btn-ghost btn-xs size-5 min-h-0 p-0"
									disabled={idx === sortedStages.length - 1 || isMoving !== null}
									onclick={() => handleMove(stage, 'down')}
								>
									<AltArrowDown class="size-3.5" />
								</button>
							</div>
							<div class="min-w-0 flex-1">
								<span class="font-medium">{getStageLabel(stage)}</span>
								<p class="text-base-content/50 mt-0.5 text-xs">
									{m.activities_stagesDurationSuffix({ duration: stage.duration })}
									{#if stage.coords}
										<span class="mx-1">·</span>
										<MapPoint class="inline size-3" />
									{/if}
									{#if getStageTags(stage).length > 0}
										<span class="mx-1">·</span>
										{getStageTags(stage).join(' · ')}
									{/if}
								</p>
							</div>
							<button
								type="button"
								class="btn btn-ghost btn-xs text-error hover:bg-error/10"
								disabled={isRemoving === stage.id || isMoving !== null}
								onclick={() => handleRemove(stage)}
							>
								{#if isRemoving === stage.id}
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

<!-- Create stage dialog -->
<PureHtmlDialog bind:this={dialog} title={m.activities_stagesDialogTitle()}>
	{#snippet content()}
		<div class="space-y-4">
			<div class="form-control">
				<label class="label text-sm" for="dialogStageName">
					<span>{m.activities_stagesNameLabel()}</span>
				</label>
				<input
					id="dialogStageName"
					type="text"
					class="input w-full"
					placeholder={m.activities_stagesNamePlaceholder()}
					bind:value={selectedName}
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="form-control">
					<label class="label text-sm" for="dialogStageKind">
						<span>{m.activities_stagesKindLabel()}</span>
					</label>
					<select id="dialogStageKind" class="select w-full" bind:value={selectedKind}>
						{#each STAGE_KIND_OPTIONS as option (option.id)}
							<option value={option.id}>{option.name}</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label class="label text-sm" for="dialogStageDuration">
						<span>{m.activities_stagesDurationLabel()}</span>
					</label>
					<input
						id="dialogStageDuration"
						type="number"
						class="input w-full"
						min="1"
						placeholder={m.activities_stagesDurationPlaceholder()}
						bind:value={selectedDuration}
					/>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="form-control">
					<label class="label text-sm" for="dialogStageRelevance">
						<span>{m.activities_stagesRelevanceLabel()}</span>
					</label>
					<select id="dialogStageRelevance" class="select w-full" bind:value={selectedRelevance}>
						{#each STAGE_RELEVANCE_OPTIONS as option (option.id)}
							<option value={option.id}>{option.name}</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label class="label text-sm" for="dialogStageRequirement">
						<span>{m.activities_stagesRequirementLabel()}</span>
					</label>
					<select
						id="dialogStageRequirement"
						class="select w-full"
						bind:value={selectedRequirement}
					>
						{#each STAGE_REQUIREMENT_OPTIONS as option (option.id)}
							<option value={option.id}>{option.name}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="form-control">
				<label class="label text-sm" for="dialogStageDescription">
					<span>{m.activities_stagesDescriptionLabel()}</span>
				</label>
				<textarea
					id="dialogStageDescription"
					class="textarea w-full"
					rows={3}
					placeholder={m.activities_stagesDescriptionPlaceholder()}
					bind:value={selectedDescription}
				></textarea>
			</div>

			{#if selectedKind === StageKind.EXPERIENCE}
				<FormGeoJson
					id="stageCoords"
					label={m.activities_stagesLocationLabel()}
					bind:value={selectedCoords}
					mapClass="h-[280px]"
					config={{ showSearchBox: true }}
				/>
			{/if}
		</div>
	{/snippet}
	{#snippet actions()}
		<button type="button" class="btn btn-ghost" onclick={() => dialog.close()}>
			{m.common_cancel()}
		</button>
		<button
			type="button"
			class="btn btn-primary"
			disabled={isAdding || selectedDuration <= 0}
			onclick={handleAdd}
		>
			{#if isAdding}
				<span class="loading loading-spinner loading-xs"></span>
			{/if}
			{m.activities_stagesCreateButton()}
		</button>
	{/snippet}
</PureHtmlDialog>
