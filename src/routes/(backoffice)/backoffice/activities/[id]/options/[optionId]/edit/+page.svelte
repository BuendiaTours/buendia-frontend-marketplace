<script lang="ts">
	/**
	 * Activity option edit page — General tab.
	 * Full form for editing option main data and configuration.
	 */
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import type { PageProps } from './$types';
	import { Database, Settings } from '$lib/icons/Linear';
	import {
		OPTION_BOOKING_SYSTEM_OPTIONS,
		OPTION_DURATION_UNIT_OPTIONS,
		OPTION_LANGUAGE_OPTIONS,
		OPTION_PRIVACY_OPTIONS,
		OPTION_STATUS_OPTIONS,
		OPTION_TICKET_KIND_OPTIONS,
		OPTION_WHEELCHAIR_OPTIONS
	} from '$lib/labels/activityOptions';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import FormTextarea from '$lib/components/backoffice/forms/FormTextarea.svelte';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting } = superForm(data.form, {
		dataType: 'json'
	});

	const formId = 'activity-option-form';
</script>

<div class="mb-4 flex justify-end">
	<button form={formId} type="submit" class="btn btn-outline btn-primary" disabled={$submitting}>
		{#if $submitting}
			<span class="loading loading-spinner loading-sm"></span>
		{/if}
		{m.activities_optionSaveChanges()}
	</button>
</div>

<form id={formId} method="POST" action="?/update" use:enhance class="space-y-4">
	<FormAccordion name="form-option-main" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>{m.activities_optionSectionMainData()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.activities_optionSectionMainDataDescription()}</p>
		{/snippet}
		{#snippet content()}
			<input type="hidden" name="id" value={$form.id} />

			<FormInputText
				id="title"
				label={m.activities_optionLabelTitle()}
				placeholder={m.activities_optionPlaceholderTitle()}
				bind:value={$form.title}
				error={$errors.title}
				wrapperClass="md:col-span-12"
			/>

			<FormSelect
				id="language"
				label={m.activities_optionLabelLanguage()}
				bind:value={$form.language}
				error={$errors.language}
				options={OPTION_LANGUAGE_OPTIONS}
				placeholder={m.activities_optionPlaceholderLanguage()}
				wrapperClass="md:col-span-4"
			/>

			<FormSelect
				id="bookingSystem"
				label={m.activities_optionLabelBookingSystem()}
				bind:value={$form.bookingSystem}
				error={$errors.bookingSystem}
				options={OPTION_BOOKING_SYSTEM_OPTIONS}
				placeholder={m.activities_optionPlaceholderBookingSystem()}
				wrapperClass="md:col-span-4"
			/>

			<FormSelect
				id="privacy"
				label={m.activities_optionLabelPrivacy()}
				bind:value={$form.privacy}
				error={$errors.privacy}
				options={OPTION_PRIVACY_OPTIONS}
				placeholder={m.activities_optionPlaceholderPrivacy()}
				wrapperClass="md:col-span-4"
			/>

			<FormInputText
				id="durationQuantity"
				label={m.activities_optionLabelDurationQuantity()}
				type="number"
				bind:value={$form.durationQuantity}
				error={$errors.durationQuantity}
				wrapperClass="md:col-span-6"
			/>

			<FormSelect
				id="durationUnit"
				label={m.activities_optionLabelDurationUnit()}
				bind:value={$form.durationUnit}
				error={$errors.durationUnit}
				options={OPTION_DURATION_UNIT_OPTIONS}
				wrapperClass="md:col-span-6"
			/>

			<FormTextarea
				id="description"
				label={m.activities_optionLabelDescription()}
				placeholder={m.activities_optionPlaceholderDescription()}
				bind:value={$form.description}
				error={$errors.description}
				rows={3}
				wrapperClass="md:col-span-12"
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-option-config" open>
		{#snippet title()}
			<Settings class="size-6" />
			<span>{m.activities_optionSectionConfig()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.activities_optionSectionConfigDescription()}</p>
		{/snippet}
		{#snippet content()}
			<FormSelect
				id="status"
				label={m.activities_optionLabelStatus()}
				bind:value={$form.status}
				error={$errors.status}
				options={OPTION_STATUS_OPTIONS}
				placeholder={m.activities_optionPlaceholderStatus()}
				wrapperClass="md:col-span-4"
			/>

			<FormSelect
				id="wheelchair"
				label={m.activities_optionLabelWheelchair()}
				bind:value={$form.wheelchair}
				error={$errors.wheelchair}
				options={OPTION_WHEELCHAIR_OPTIONS}
				placeholder={m.activities_optionPlaceholderWheelchair()}
				wrapperClass="md:col-span-4"
			/>

			<FormSelect
				id="ticketKind"
				label={m.activities_optionLabelTicketKind()}
				bind:value={$form.ticketKind}
				error={$errors.ticketKind}
				options={OPTION_TICKET_KIND_OPTIONS}
				placeholder={m.activities_optionPlaceholderTicketKind()}
				wrapperClass="md:col-span-4"
			/>

			<FormInputText
				id="maxGroupSize"
				label={m.activities_optionLabelMaxGroupSize()}
				type="number"
				bind:value={$form.maxGroupSize}
				error={$errors.maxGroupSize}
				wrapperClass="md:col-span-4"
			/>

			<FormInputText
				id="maxTicketsPerIndividual"
				label={m.activities_optionLabelMaxTicketsPerIndividual()}
				type="number"
				bind:value={$form.maxTicketsPerIndividual}
				error={$errors.maxTicketsPerIndividual}
				wrapperClass="md:col-span-4"
			/>

			<FormInputText
				id="supplierOptionCode"
				label={m.activities_optionLabelSupplierOptionCode()}
				placeholder={m.activities_optionPlaceholderSupplierOptionCode()}
				bind:value={$form.supplierOptionCode}
				error={$errors.supplierOptionCode}
				wrapperClass="md:col-span-4"
			/>
		{/snippet}
	</FormAccordion>
</form>
