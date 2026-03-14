<script lang="ts">
	/**
	 * SupplierForm — Reusable form for creating and editing suppliers.
	 * Handles identity, contact info, and public profile fields.
	 */
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import { SUPPLIER_STATUS_OPTIONS } from '$lib/labels/suppliers';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { SupplierFormSchema } from '../schemas/supplier-form.schema';

	import { Database, MapPoint, Link } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormInputSlug from '$lib/components/backoffice/forms/FormInputSlug.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import FormTextarea from '$lib/components/backoffice/forms/FormTextarea.svelte';
	import FormTextareaMarkdown from '$lib/components/backoffice/forms/FormTextareaMarkdown.svelte';
	import SupplierFormActions from './SupplierFormActions.svelte';

	type Props = {
		form: SuperValidated<SupplierFormSchema>;
		mode: 'create' | 'edit';
		/** Required in edit mode — used to build the delete action URL. */
		supplierId?: string;
	};

	let { form: formData, mode, supplierId }: Props = $props();

	const isEditMode = $derived(mode === 'edit');
	const formAction = $derived(isEditMode ? '?/update' : undefined);

	// formData is intentionally captured once at mount
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance } = superForm(formData, {
		dataType: 'json'
	});

	const formId = 'supplier-form';
</script>

<SupplierFormActions {mode} {supplierId} {formId} />

<form id={formId} method="POST" action={formAction} use:enhance class="space-y-4">
	<FormAccordion name="form-supplier-data" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>{m.suppliers_sectionMainData()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.suppliers_sectionMainDataDescription()}</p>
		{/snippet}
		{#snippet content()}
			<input type="hidden" name="id" value={$form.id} />

			<FormInputText
				id="name"
				label={m.suppliers_labelName()}
				bind:value={$form.name}
				error={$errors.name}
				wrapperClass="md:col-span-8"
			/>

			<FormSelect
				id="status"
				label={m.suppliers_labelStatus()}
				bind:value={$form.status}
				error={$errors.status}
				options={SUPPLIER_STATUS_OPTIONS}
				placeholder={m.suppliers_placeholderStatus()}
				wrapperClass="md:col-span-4"
			/>

			<FormInputSlug
				id="slug"
				label={m.suppliers_labelSlug()}
				bind:value={$form.slug}
				sourceValue={$form.name}
				error={$errors.slug}
				disabled={isEditMode}
				wrapperClass="md:col-span-6"
			/>

			<FormInputText
				id="companyName"
				label={m.suppliers_labelCompanyName()}
				bind:value={$form.companyName}
				error={$errors.companyName}
				wrapperClass="md:col-span-6"
			/>

			<FormInputText
				id="vat"
				label={m.suppliers_labelVat()}
				bind:value={$form.vat}
				error={$errors.vat}
				wrapperClass="md:col-span-6"
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-supplier-contact" open>
		{#snippet title()}
			<MapPoint class="size-6" />
			<span>{m.suppliers_sectionContact()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.suppliers_sectionContactDescription()}</p>
		{/snippet}
		{#snippet content()}
			<FormInputText
				id="ownerFirstName"
				label={m.suppliers_labelOwnerFirstName()}
				bind:value={$form.ownerFirstName}
				error={$errors.ownerFirstName}
				wrapperClass="md:col-span-6"
			/>

			<FormInputText
				id="ownerLastName"
				label={m.suppliers_labelOwnerLastName()}
				bind:value={$form.ownerLastName}
				error={$errors.ownerLastName}
				wrapperClass="md:col-span-6"
			/>

			<FormInputText
				id="email"
				label={m.suppliers_labelEmail()}
				bind:value={$form.email}
				error={$errors.email}
				wrapperClass="md:col-span-6"
			/>

			<FormInputText
				id="phone"
				label={m.suppliers_labelPhone()}
				bind:value={$form.phone}
				error={$errors.phone}
				wrapperClass="md:col-span-6"
			/>

			<FormTextarea
				id="postalAddress"
				label={m.suppliers_labelPostalAddress()}
				bind:value={$form.postalAddress}
				error={$errors.postalAddress}
				rows={2}
				wrapperClass="md:col-span-12"
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-supplier-profile" open>
		{#snippet title()}
			<Link class="size-6" />
			<span>{m.suppliers_sectionProfile()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.suppliers_sectionProfileDescription()}</p>
		{/snippet}
		{#snippet content()}
			<FormInputText
				id="logoUrl"
				label={m.suppliers_labelLogoUrl()}
				bind:value={$form.logoUrl}
				error={$errors.logoUrl}
				wrapperClass="md:col-span-12"
			/>

			<FormTextareaMarkdown
				id="aboutUs"
				label={m.suppliers_labelAboutUs()}
				bind:value={$form.aboutUs}
				error={$errors.aboutUs}
			/>
		{/snippet}
	</FormAccordion>
</form>
