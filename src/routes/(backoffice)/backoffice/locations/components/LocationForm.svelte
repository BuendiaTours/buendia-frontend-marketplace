<script lang="ts">
	/**
	 * LocationForm — Reusable form for creating and editing locations.
	 * Handles parent search, name, kind, and short description fields.
	 */
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import { LOCATION_KIND_OPTIONS } from '$lib/labels/locations';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { LocationFormSchema } from '../schemas/location-form.schema';

	import { Database } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormGeoJson from '$lib/components/backoffice/forms/FormGeoJson.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import FormTextareaMarkdown from '$lib/components/backoffice/forms/FormTextareaMarkdown.svelte';
	import LocationFormActions from './LocationFormActions.svelte';
	import FormAsyncSearch from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
	import { searchLocations, loadLocationById } from '../queries/location-search.queries';

	type Props = {
		form: SuperValidated<LocationFormSchema>;
		mode: 'create' | 'edit';
		/** Required in edit mode — used to build the delete action URL. */
		locationId?: string;
		/** Display name of the current parent, used as initial label for the async search. */
		parentName?: string | null;
	};

	let { form: formData, mode, locationId, parentName }: Props = $props();

	const isEditMode = $derived(mode === 'edit');
	const formAction = $derived(isEditMode ? '?/update' : undefined);

	// formData is intentionally captured once at mount
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting } = superForm(formData, {
		dataType: 'json'
	});

	const formId = 'location-form';
</script>

<LocationFormActions {mode} {locationId} {formId} submitting={$submitting} />

<form id={formId} method="POST" action={formAction} use:enhance class="space-y-4">
	<FormAccordion name="form-location-data" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>{m.locations_sectionMainData()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.locations_sectionMainDataDescription()}</p>
		{/snippet}
		{#snippet content()}
			<input type="hidden" name="id" value={$form.id} />

			<!-- excludeValue prevents a location from being set as its own parent -->
			<FormAsyncSearch
				id="parentId"
				label={m.locations_labelParent()}
				placeholder={m.locations_placeholderParent()}
				bind:value={$form.parentId}
				searchFn={searchLocations}
				loadSelectedFn={loadLocationById}
				initialLabel={parentName}
				excludeValue={$form.id}
				wrapperClass="md:col-span-12"
			/>

			<FormInputText
				id="name"
				label={m.locations_labelName()}
				bind:value={$form.name}
				error={$errors.name}
				badge={isEditMode ? m.locations_badgeReadOnly() : undefined}
				wrapperClass="md:col-span-12"
			/>

			<FormSelect
				id="kind"
				label={m.locations_labelKind()}
				bind:value={$form.kind}
				error={$errors.kind}
				options={LOCATION_KIND_OPTIONS}
				placeholder={m.locations_placeholderKind()}
				wrapperClass="md:col-span-12"
			/>

			<FormTextareaMarkdown
				id="descriptionLong"
				label={m.locations_labelDescriptionLong()}
				bind:value={$form.descriptionLong}
				error={$errors.descriptionLong}
				wrapperClass="md:col-span-12"
			/>

			<FormGeoJson
				id="location"
				label={m.locations_labelLocation()}
				bind:value={$form.location}
				error={$errors.location?._errors}
				config={{ showSearchBox: true }}
			/>
		{/snippet}
	</FormAccordion>
</form>
