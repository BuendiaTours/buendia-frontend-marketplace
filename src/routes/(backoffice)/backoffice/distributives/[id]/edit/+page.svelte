<script lang="ts">
	/**
	 * Edit distributive page — General tab.
	 * Loads the existing distributive data and renders the form in edit mode.
	 */
	import type { PageProps } from './$types';
	import DistributiveForm from '../../components/DistributiveForm.svelte';

	let { data }: PageProps = $props();
</script>

<DistributiveForm
	form={data.form}
	mode="edit"
	distributiveId={data.distributive.id}
	distributiveStatus={data.distributive.status}
	totalActivities={data.distributive.totalActivities}
	categories={data.distributive.categories}
	availableCategories={data.availableCategories}
	attractions={data.distributive.attractions}
	availableAttractions={data.availableAttractions}
	locations={data.distributive.locations}
	availableLocations={data.availableLocations}
/>
