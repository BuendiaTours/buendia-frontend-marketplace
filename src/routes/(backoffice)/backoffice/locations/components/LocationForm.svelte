<script lang="ts">
	/**
	 * LocationForm - Reusable form for creating and editing locations
	 */
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import { LOCATION_KIND_OPTIONS } from '$lib/labels/locations';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { LocationFormSchema } from '../schemas/location-form.schema';

	import { Database } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import FormTextarea from '$lib/components/backoffice/forms/FormTextarea.svelte';
	import LocationFormActions from './LocationFormActions.svelte';
	import FormAsyncSearch from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
	import { searchLocations, loadLocationById } from '../queries/location-search.queries';

	type Props = {
		data: {
			form: SuperValidated<LocationFormSchema>;
		};
		mode: 'create' | 'edit';
		locationId?: string;
		parentName?: string | null;
	};

	let { data, mode, locationId, parentName }: Props = $props();

	const isEditMode = $derived(mode === 'edit');

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance } = superForm(data.form, {
		dataType: 'json'
	});

	const formId = 'location-form';
</script>

<LocationFormActions {mode} {locationId} {formId} />

<form id={formId} method="POST" use:enhance class="space-y-4">
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

			<FormTextarea
				id="descriptionShort"
				label={m.locations_labelDescriptionShort()}
				bind:value={$form.descriptionShort}
				error={$errors.descriptionShort}
				rows={3}
				wrapperClass="md:col-span-12"
			/>
		{/snippet}
	</FormAccordion>
</form>
