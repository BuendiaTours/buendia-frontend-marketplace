<script lang="ts">
	/**
	 * AttractionForm — Reusable form for creating and editing attractions.
	 * Handles name, status, descriptions, destinations, address, and map fields.
	 */
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import { ATTRACTION_STATUS_OPTIONS } from '$lib/labels/attractions';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { AttractionFormSchema } from '../schemas/attraction-form.schema';

	import { Database, MapPoint } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormGeoJson from '$lib/components/backoffice/forms/FormGeoJson.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormOrderedObjectList from '$lib/components/backoffice/forms/FormOrderedObjectList.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import FormTextarea from '$lib/components/backoffice/forms/FormTextarea.svelte';
	import FormTextareaMarkdown from '$lib/components/backoffice/forms/FormTextareaMarkdown.svelte';
	import AttractionFormActions from './AttractionFormActions.svelte';

	type Props = {
		form: SuperValidated<AttractionFormSchema>;
		mode: 'create' | 'edit';
		/** Required in edit mode — used to build the delete action URL. */
		attractionId?: string;
		availableLocations: Array<{ id: string; name: string }>;
	};

	let { form: formData, mode, attractionId, availableLocations }: Props = $props();

	const isEditMode = $derived(mode === 'edit');
	const formAction = $derived(isEditMode ? '?/update' : undefined);

	// formData is intentionally captured once at mount
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance } = superForm(formData, {
		dataType: 'json'
	});

	const formId = 'attraction-form';
</script>

<AttractionFormActions {mode} {attractionId} {formId} />

<form id={formId} method="POST" action={formAction} use:enhance class="space-y-4">
	<FormAccordion name="form-attraction-data" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>{m.attractions_sectionMainData()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.attractions_sectionMainDataDescription()}</p>
		{/snippet}
		{#snippet content()}
			<input type="hidden" name="id" value={$form.id} />

			<FormInputText
				id="name"
				label={m.attractions_labelName()}
				bind:value={$form.name}
				error={$errors.name}
				wrapperClass="md:col-span-8"
			/>

			<FormSelect
				id="status"
				label={m.attractions_labelStatus()}
				bind:value={$form.status}
				error={$errors.status}
				options={ATTRACTION_STATUS_OPTIONS}
				placeholder={m.attractions_placeholderStatus()}
				wrapperClass="md:col-span-4"
			/>

			<FormTextarea
				id="description"
				label={m.attractions_labelDescription()}
				bind:value={$form.description}
				error={$errors.description}
				rows={3}
				wrapperClass="md:col-span-12"
			/>

			<FormTextareaMarkdown
				id="descriptionLong"
				label={m.attractions_labelDescriptionLong()}
				bind:value={$form.descriptionLong}
				error={$errors.descriptionLong}
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-attraction-location" open>
		{#snippet title()}
			<MapPoint class="size-6" />
			<span>{m.attractions_sectionLocation()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.attractions_sectionLocationDescription()}</p>
		{/snippet}
		{#snippet content()}
			<FormOrderedObjectList
				id="destinations"
				label={m.attractions_labelDestinations()}
				bind:items={$form.destinations}
				availableItems={availableLocations}
				error={$errors.destinations?._errors}
				placeholder={m.attractions_placeholderDestinations()}
				emptyMessage={m.attractions_emptyDestinations()}
			/>

			<FormTextarea
				id="postalAddress"
				label={m.attractions_labelPostalAddress()}
				bind:value={$form.postalAddress}
				error={$errors.postalAddress}
				rows={2}
				wrapperClass="md:col-span-12"
			/>

			<FormGeoJson
				id="location"
				label={m.attractions_labelLocation()}
				bind:value={$form.location}
				error={$errors.location?._errors}
				config={{ showSearchBox: true }}
			/>
		{/snippet}
	</FormAccordion>
</form>
