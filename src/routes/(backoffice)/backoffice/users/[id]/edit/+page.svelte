<script lang="ts">
	/**
	 * Edit user page.
	 * Loads the existing user data and renders the form in edit mode.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import UserForm from '../../components/UserForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, {
			label: data.user.name || m.users_breadcrumbUser()
		})
	);
</script>

<svelte:head>
	<title>{m.users_editPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.users_editPageTitle()} {breadcrumbs} />

<UserForm form={data.form} mode="edit" />
