<script lang="ts">
	/**
	 * LocationForm - Reusable form for creating and editing locations
	 */
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import { LOCATION_KIND_OPTIONS } from '$lib/labels/locations';
	import type { Location } from '$lib/types';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { LocationFormSchema } from '../schemas/location-form.schema';

	import { Database } from '$lib/icons/Linear';
	import DebugApiJson from '$lib/components/backoffice/debug/DebugApiJson.svelte';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import FormTextarea from '$lib/components/backoffice/forms/FormTextarea.svelte';
	import LocationFormActions from './LocationFormActions.svelte';

	type Props = {
		data: {
			form: SuperValidated<LocationFormSchema>;
			location?: Location;
		};
		mode: 'create' | 'edit';
		locationId?: string;
	};

	let { data, mode, locationId }: Props = $props();

	const isEditMode = $derived(mode === 'edit');
	const location = $derived(isEditMode ? data.location : null);

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

			<FormInputText
				id="name"
				label={m.locations_labelName()}
				bind:value={$form.name}
				error={$errors.name}
				readonly={isEditMode}
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

<DebugApiJson data={isEditMode ? location : $form} />
