<script lang="ts">
	/**
	 * FreeTourMeetingPointAccordion — Manages the free tour meeting point.
	 * Saves via PATCH to the free tour update endpoint (meetingPoint field).
	 */
	import * as m from '$paraglide/messages';
	import { invalidateAll } from '$app/navigation';
	import { MapPoint } from '$lib/icons/Linear';
	import { FREE_TOUR_REQUEST } from '$core/free-tours/requests';
	import type { FreeTourMeetingPoint } from '$core/free-tours/types';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormGeoJson from '$lib/components/backoffice/forms/FormGeoJson.svelte';

	type ToastFn = (data: {
		data: { title: string; description: string; type: 'success' | 'error' };
	}) => void;

	type GeoJsonPoint = {
		type: 'Point';
		coordinates: [number, number];
	};

	type Props = {
		freeTourId: string;
		meetingPoint: FreeTourMeetingPoint | null;
		addToast?: ToastFn;
	};

	let { freeTourId, meetingPoint, addToast }: Props = $props();

	// All $state values intentionally capture meetingPoint once — user edits locally and saves explicitly
	// svelte-ignore state_referenced_locally
	let enabled = $state(meetingPoint !== null);
	// svelte-ignore state_referenced_locally
	let name = $state(meetingPoint?.name ?? '');
	// svelte-ignore state_referenced_locally
	let address = $state(meetingPoint?.address ?? '');
	// svelte-ignore state_referenced_locally
	let city = $state(meetingPoint?.city ?? '');
	// svelte-ignore state_referenced_locally
	let postCode = $state(meetingPoint?.postCode ?? '');
	// svelte-ignore state_referenced_locally
	let countryCode = $state(meetingPoint?.countryCode ?? '');
	// svelte-ignore state_referenced_locally
	let location = $state<GeoJsonPoint | null>(
		meetingPoint?.coords
			? {
					type: 'Point',
					coordinates: [meetingPoint.coords.longitude, meetingPoint.coords.latitude]
				}
			: null
	);

	let isSaving = $state(false);

	function showToast(type: 'success' | 'error', description: string) {
		addToast?.({ data: { title: type === 'success' ? '✓' : '✗', description, type } });
	}

	async function handleSave() {
		isSaving = true;
		try {
			const mp = enabled
				? {
						name,
						address: address || '',
						city: city || '',
						postCode: postCode || '',
						countryCode: countryCode || '',
						coords: location
							? { latitude: location.coordinates[1], longitude: location.coordinates[0] }
							: { latitude: 0, longitude: 0 }
					}
				: null;

			await FREE_TOUR_REQUEST.update(fetch, freeTourId, {
				meetingPoint: mp ?? undefined
			});
			await new Promise((resolve) => setTimeout(resolve, 500));
			await invalidateAll();
			showToast('success', m.activities_meetingPointSaved());
		} catch (err) {
			console.error('Error saving meeting point:', err);
			showToast('error', m.activities_meetingPointError());
		} finally {
			isSaving = false;
		}
	}
</script>

<FormAccordion name="form-free-tour-meeting-point" open>
	{#snippet title()}
		<MapPoint class="size-6" />
		<span>{m.activities_sectionMeetingPoint()}</span>
	{/snippet}
	{#snippet asideContent()}
		<p class="text-xs">{m.activities_sectionMeetingPointDescription()}</p>
	{/snippet}
	{#snippet content()}
		<div class="md:col-span-12">
			<label class="label cursor-pointer justify-start gap-3">
				<input type="checkbox" class="toggle toggle-primary" bind:checked={enabled} />
				<span class="text-sm">{m.activities_meetingPointEnabled()}</span>
			</label>
		</div>

		{#if enabled}
			<FormInputText
				id="meetingPointName"
				label={m.activities_labelMeetingPointName()}
				bind:value={name}
				wrapperClass="md:col-span-6"
			/>

			<FormInputText
				id="meetingPointAddress"
				label={m.activities_labelMeetingPointAddress()}
				bind:value={address}
				wrapperClass="md:col-span-6"
			/>

			<FormInputText
				id="meetingPointCity"
				label={m.activities_labelMeetingPointCity()}
				bind:value={city}
				wrapperClass="md:col-span-4"
			/>

			<FormInputText
				id="meetingPointPostCode"
				label={m.activities_labelMeetingPointPostCode()}
				bind:value={postCode}
				wrapperClass="md:col-span-4"
			/>

			<FormInputText
				id="meetingPointCountryCode"
				label={m.activities_labelMeetingPointCountryCode()}
				bind:value={countryCode}
				wrapperClass="md:col-span-4"
			/>

			<FormGeoJson
				id="meetingPointLocation"
				label={m.activities_labelMeetingPointLocation()}
				bind:value={location}
				config={{ showSearchBox: true }}
			/>
		{/if}

		<div class="flex justify-end md:col-span-12">
			<button
				type="button"
				class="btn btn-outline btn-primary btn-sm"
				disabled={isSaving}
				onclick={handleSave}
			>
				{#if isSaving}
					<span class="loading loading-spinner loading-xs"></span>
				{/if}
				{m.activities_meetingPointSaveButton()}
			</button>
		</div>
	{/snippet}
</FormAccordion>
