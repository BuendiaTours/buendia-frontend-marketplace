<script lang="ts">
	/**
	 * General tab — main form fields for an existing activity.
	 * Includes: main data, transport, config, additional, pets, restrictions.
	 */
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import type { PageProps } from './$types';
	import {
		ACTIVITY_STATUS_OPTIONS,
		ACTIVITY_KIND_OPTIONS,
		ACTIVITY_GUIDE_KIND_OPTIONS,
		ACTIVITY_DATE_MODE_OPTIONS,
		ACTIVITY_TRANSPORT_KIND_OPTIONS,
		ACTIVITY_TRANSPORT_LOCATION_OPTIONS,
		ACTIVITY_PETS_ALLOWED_OPTIONS,
		ACTIVITY_RESTRICTION_OPTIONS,
		ACTIVITY_NOT_SUITABLE_FOR_OPTIONS
	} from '$lib/labels/activities';

	import { ActivityTransportLocation } from '$core/activities/enums';
	import { Database, FolderCheck, ChecklistMinimalistic, Link } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import { loadSupplierById } from '../../queries/supplier-search.queries';
	import FormTextarea from '$lib/components/backoffice/forms/FormTextarea.svelte';
	import FormTextareaMarkdown from '$lib/components/backoffice/forms/FormTextareaMarkdown.svelte';
	import FormCheckboxGroup from '$lib/components/backoffice/forms/FormCheckboxGroup.svelte';
	import FormOrderedStringList from '$lib/components/backoffice/forms/FormOrderedStringList.svelte';
	import ActivityFormActions from '../../components/ActivityFormActions.svelte';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting } = superForm(data.form, {
		dataType: 'json'
	});

	const formId = 'activity-form';

	let supplierName = $state('');
	$effect(() => {
		if ($form.supplierId && !supplierName) {
			loadSupplierById($form.supplierId).then((result) => {
				if (result) supplierName = result.label;
			});
		}
	});

	$effect(() => {
		if (
			$form.transportKind === 'NONE' &&
			$form.transportLocation !== ActivityTransportLocation.NOT_APPLY
		) {
			$form.transportLocation = ActivityTransportLocation.NOT_APPLY;
		}
	});
</script>

<ActivityFormActions mode="edit" activityId={data.activity.id} {formId} submitting={$submitting} />

<form id={formId} method="POST" action="?/update" use:enhance class="space-y-4">
	<FormAccordion name="form-activity-data" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>{m.activities_sectionMainData()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.activities_sectionMainDataDescription()}</p>
		{/snippet}
		{#snippet content()}
			<input type="hidden" name="id" value={$form.id} />

			<FormInputText
				id="title"
				label={m.activities_labelTitle()}
				bind:value={$form.title}
				error={$errors.title}
				wrapperClass="md:col-span-12"
			/>

			<FormTextarea
				id="descriptionShort"
				label={m.activities_labelDescriptionShort()}
				bind:value={$form.descriptionShort}
				error={$errors.descriptionShort}
				rows={3}
				wrapperClass="md:col-span-12"
			/>

			<FormTextareaMarkdown
				id="descriptionFull"
				label={m.activities_labelDescriptionFull()}
				bind:value={$form.descriptionFull}
				error={$errors.descriptionFull}
			/>

			<FormOrderedStringList
				id="willDoing"
				label={m.activities_labelWillDoing()}
				bind:items={$form.willDoing}
				error={$errors.willDoing?._errors}
				placeholder={m.activities_placeholderWillDoing()}
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-activity-transport" open>
		{#snippet title()}
			<Link class="size-6" />
			<span>{m.activities_sectionTransport()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.activities_sectionTransportDescription()}</p>
		{/snippet}
		{#snippet content()}
			<FormSelect
				id="transportKind"
				label={m.activities_labelTransportKind()}
				bind:value={$form.transportKind}
				error={$errors.transportKind}
				options={ACTIVITY_TRANSPORT_KIND_OPTIONS}
				placeholder={m.activities_placeholderTransportKind()}
				wrapperClass="md:col-span-4"
			/>

			<FormSelect
				id="transportLocation"
				label={m.activities_labelTransportLocation()}
				bind:value={$form.transportLocation}
				error={$errors.transportLocation}
				options={ACTIVITY_TRANSPORT_LOCATION_OPTIONS}
				placeholder={m.activities_placeholderTransportLocation()}
				disabled={$form.transportKind === 'NONE'}
				wrapperClass="md:col-span-4"
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-activity-content" open>
		{#snippet title()}
			<ChecklistMinimalistic class="size-6" />
			<span>{m.activities_sectionContent()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.activities_sectionContentDescription()}</p>
		{/snippet}
		{#snippet content()}
			<FormOrderedStringList
				id="included"
				label={m.activities_labelIncluded()}
				bind:items={$form.included}
				error={$errors.included?._errors}
				placeholder={m.activities_placeholderIncluded()}
			/>

			<FormOrderedStringList
				id="excluded"
				label={m.activities_labelExcluded()}
				bind:items={$form.excluded}
				error={$errors.excluded?._errors}
				placeholder={m.activities_placeholderExcluded()}
			/>

			<FormOrderedStringList
				id="itemsToBring"
				label={m.activities_labelItemsToBring()}
				bind:items={$form.itemsToBring}
				error={$errors.itemsToBring?._errors}
				placeholder={m.activities_placeholderItemsToBring()}
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-activity-config" open>
		{#snippet title()}
			<FolderCheck class="size-6" />
			<span>{m.activities_sectionConfig()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.activities_sectionConfigDescription()}</p>
		{/snippet}
		{#snippet content()}
			<FormSelect
				id="status"
				label={m.activities_labelStatus()}
				bind:value={$form.status}
				error={$errors.status}
				options={ACTIVITY_STATUS_OPTIONS}
				placeholder={m.activities_placeholderStatus()}
				wrapperClass="md:col-span-4"
			/>

			<FormSelect
				id="kind"
				label={m.activities_labelKind()}
				bind:value={$form.kind}
				error={$errors.kind}
				options={ACTIVITY_KIND_OPTIONS}
				placeholder={m.activities_placeholderKind()}
				wrapperClass="md:col-span-4"
			/>

			<FormSelect
				id="dateMode"
				label={m.activities_labelDateMode()}
				bind:value={$form.dateMode}
				error={$errors.dateMode}
				options={ACTIVITY_DATE_MODE_OPTIONS}
				placeholder={m.activities_placeholderDateMode()}
				wrapperClass="md:col-span-4"
			/>

			<FormSelect
				id="guideKind"
				label={m.activities_labelGuideKind()}
				bind:value={$form.guideKind}
				error={$errors.guideKind}
				options={ACTIVITY_GUIDE_KIND_OPTIONS}
				placeholder={m.activities_placeholderGuideKind()}
				wrapperClass="md:col-span-4"
			/>

			<FormInputText
				id="supplierId"
				label={m.activities_labelSupplierId()}
				value={supplierName || $form.supplierId}
				badge="read only"
				readonly
				wrapperClass="md:col-span-4"
			/>

			<FormInputText
				id="codeRef"
				label={m.activities_labelCodeRef()}
				bind:value={$form.codeRef}
				error={$errors.codeRef}
				wrapperClass="md:col-span-4"
			/>

			<FormInputText
				id="slug"
				label={m.activities_labelSlug()}
				bind:value={$form.slug}
				error={$errors.slug}
				badge="read only"
				readonly
				wrapperClass="md:col-span-12"
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-activity-additional" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>{m.activities_sectionAdditional()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.activities_sectionAdditionalDescription()}</p>
		{/snippet}
		{#snippet content()}
			<FormInputText
				id="phoneContact"
				label={m.activities_labelPhoneContact()}
				bind:value={$form.phoneContact}
				error={$errors.phoneContact}
				wrapperClass="md:col-span-4"
			/>

			<FormTextarea
				id="infoImportant"
				label={m.activities_labelInfoImportant()}
				bind:value={$form.infoImportant}
				error={$errors.infoImportant}
				rows={3}
				wrapperClass="md:col-span-12"
			/>

			<FormTextarea
				id="voucherInfo"
				label={m.activities_labelVoucherInfo()}
				bind:value={$form.voucherInfo}
				error={$errors.voucherInfo}
				rows={3}
				wrapperClass="md:col-span-12"
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-activity-pets" open>
		{#snippet title()}
			<span class="text-xl">🐾</span>
			<span>{m.activities_sectionPets()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.activities_sectionPetsDescription()}</p>
		{/snippet}
		{#snippet content()}
			<FormSelect
				id="petsAllowed"
				label={m.activities_labelPetsAllowed()}
				bind:value={$form.petsAllowed}
				error={$errors.petsAllowed}
				options={ACTIVITY_PETS_ALLOWED_OPTIONS}
				placeholder={m.activities_placeholderPetsAllowed()}
				wrapperClass="md:col-span-4"
			/>

			<FormTextarea
				id="petsAllowedDescription"
				label={m.activities_labelPetsAllowedDescription()}
				bind:value={$form.petsAllowedDescription}
				error={$errors.petsAllowedDescription}
				rows={2}
				wrapperClass="md:col-span-8"
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-activity-restrictions" open>
		{#snippet title()}
			<ChecklistMinimalistic class="size-6" />
			<span>{m.activities_sectionRestrictions()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.activities_sectionRestrictionsDescription()}</p>
		{/snippet}
		{#snippet content()}
			<FormCheckboxGroup
				main_label={m.activities_labelRestrictions()}
				id="restrictions"
				name="restrictions[]"
				key_title="name"
				key_value="id"
				bind:items={$form.restrictions}
				availableItems={ACTIVITY_RESTRICTION_OPTIONS}
				error={$errors.restrictions?._errors}
				wrapperClass="md:col-span-6"
			/>

			<FormCheckboxGroup
				main_label={m.activities_labelNotSuitableFor()}
				id="notSuitableFor"
				name="notSuitableFor[]"
				key_title="name"
				key_value="id"
				bind:items={$form.notSuitableFor}
				availableItems={ACTIVITY_NOT_SUITABLE_FOR_OPTIONS}
				error={$errors.notSuitableFor?._errors}
				wrapperClass="md:col-span-6"
			/>
		{/snippet}
	</FormAccordion>
</form>
