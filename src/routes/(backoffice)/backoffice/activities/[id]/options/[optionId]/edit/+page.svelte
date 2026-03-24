<script lang="ts">
	/**
	 * Activity option edit page — General + Configuration.
	 * Single form with all option fields except Booking System.
	 */
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import type { PageProps } from './$types';
	import { getContext } from 'svelte';
	import { Database, Settings } from '$lib/icons/Linear';
	import {
		OPTION_DURATION_UNIT_OPTIONS,
		OPTION_LANGUAGE_OPTIONS,
		OPTION_PRIVACY_OPTIONS,
		OPTION_SKIP_THE_LINE_OPTIONS,
		OPTION_STATUS_OPTIONS,
		OPTION_WHEELCHAIR_OPTIONS
	} from '$lib/labels/activityOptions';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import FormTextarea from '$lib/components/backoffice/forms/FormTextarea.svelte';

	let { data }: PageProps = $props();

	const addToast =
		getContext<
			(toast: { data: { title: string; description: string; type: 'success' | 'error' } }) => void
		>('activityToast');

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting } = superForm(data.form, {
		dataType: 'json',
		invalidateAll: false,
		applyAction: false,
		resetForm: false,
		onResult({ result }) {
			if (result.type === 'success') {
				addToast({
					data: {
						title: m.backoffice_updateSuccess(),
						description: '',
						type: 'success'
					}
				});
			}
		}
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
	<input type="hidden" name="id" value={$form.id} />

	<FormAccordion name="form-option-main" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>{m.activities_optionSectionMainData()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.activities_optionSectionMainDataDescription()}</p>
		{/snippet}
		{#snippet content()}
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
				id="status"
				label={m.activities_optionLabelStatus()}
				bind:value={$form.status}
				error={$errors.status}
				options={OPTION_STATUS_OPTIONS}
				placeholder={m.activities_optionPlaceholderStatus()}
				wrapperClass="md:col-span-4"
			/>

			<div class="md:col-span-4"></div>

			<FormInputText
				id="durationQuantity"
				label={m.activities_optionLabelDurationQuantity()}
				type="number"
				bind:value={$form.durationQuantity}
				error={$errors.durationQuantity}
				wrapperClass="md:col-span-4"
			/>

			<FormSelect
				id="durationUnit"
				label={m.activities_optionLabelDurationUnit()}
				bind:value={$form.durationUnit}
				error={$errors.durationUnit}
				options={OPTION_DURATION_UNIT_OPTIONS}
				wrapperClass="md:col-span-4"
			/>

			<FormInputText
				id="cutOff"
				label={m.activities_optionLabelCutOff()}
				placeholder={m.activities_optionPlaceholderCutOff()}
				type="number"
				bind:value={$form.cutOff}
				error={$errors.cutOff}
				wrapperClass="md:col-span-4"
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
				id="privacy"
				label={m.activities_optionLabelPrivacy()}
				bind:value={$form.privacy}
				error={$errors.privacy}
				options={OPTION_PRIVACY_OPTIONS}
				placeholder={m.activities_optionPlaceholderPrivacy()}
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
				id="skipTheLineType"
				label={m.activities_optionLabelSkipTheLine()}
				bind:value={$form.skipTheLineType}
				error={$errors.skipTheLineType}
				options={OPTION_SKIP_THE_LINE_OPTIONS}
				placeholder={m.activities_optionPlaceholderSkipTheLine()}
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
		{/snippet}
	</FormAccordion>
</form>
