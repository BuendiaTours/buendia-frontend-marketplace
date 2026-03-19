<script lang="ts">
	/**
	 * PickupPointForm — Reusable form for creating and editing pickup points.
	 * Two sections: main data (name, address fields) and location (map).
	 */
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { PickupPointFormSchema } from '../schemas/pickup-point-form.schema';

	import { Database, MapPoint } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormGeoJson from '$lib/components/backoffice/forms/FormGeoJson.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import PickupPointFormActions from './PickupPointFormActions.svelte';

	type Props = {
		form: SuperValidated<PickupPointFormSchema>;
		mode: 'create' | 'edit';
		pickupPointId?: string;
	};

	let { form: formData, mode, pickupPointId }: Props = $props();

	const isEditMode = $derived(mode === 'edit');
	const formAction = $derived(isEditMode ? '?/update' : undefined);

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting } = superForm(formData, {
		dataType: 'json'
	});

	const formId = 'pickup-point-form';
</script>

<PickupPointFormActions {mode} {pickupPointId} {formId} submitting={$submitting} />

<form id={formId} method="POST" action={formAction} use:enhance class="space-y-4">
	<FormAccordion name="form-pickup-point-data" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>{m.pickupPoints_sectionMainData()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.pickupPoints_sectionMainDataDescription()}</p>
		{/snippet}
		{#snippet content()}
			<input type="hidden" name="id" value={$form.id} />

			<FormInputText
				id="name"
				label={m.pickupPoints_labelName()}
				placeholder={m.pickupPoints_placeholderName()}
				bind:value={$form.name}
				error={$errors.name}
				wrapperClass="md:col-span-12"
			/>

			<FormInputText
				id="address"
				label={m.pickupPoints_labelAddress()}
				placeholder={m.pickupPoints_placeholderAddress()}
				bind:value={$form.address}
				error={$errors.address}
				wrapperClass="md:col-span-12"
			/>

			<FormInputText
				id="city"
				label={m.pickupPoints_labelCity()}
				placeholder={m.pickupPoints_placeholderCity()}
				bind:value={$form.city}
				error={$errors.city}
				wrapperClass="md:col-span-4"
			/>

			<FormInputText
				id="postCode"
				label={m.pickupPoints_labelPostCode()}
				placeholder={m.pickupPoints_placeholderPostCode()}
				bind:value={$form.postCode}
				error={$errors.postCode}
				wrapperClass="md:col-span-4"
			/>

			<FormInputText
				id="countryCode"
				label={m.pickupPoints_labelCountryCode()}
				placeholder={m.pickupPoints_placeholderCountryCode()}
				bind:value={$form.countryCode}
				error={$errors.countryCode}
				wrapperClass="md:col-span-4"
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-pickup-point-location" open>
		{#snippet title()}
			<MapPoint class="size-6" />
			<span>{m.pickupPoints_sectionLocation()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.pickupPoints_sectionLocationDescription()}</p>
		{/snippet}
		{#snippet content()}
			<FormGeoJson
				id="location"
				label={m.pickupPoints_labelLocation()}
				bind:value={$form.location}
				error={$errors.location?._errors}
				config={{ showSearchBox: true }}
			/>
		{/snippet}
	</FormAccordion>
</form>
