<script lang="ts">
	import * as m from '$paraglide/messages';
	import type { PageData } from './$types';
	import UserForm from '../../components/UserForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{m.users_editUserPageTitle()}</title>
</svelte:head>

<LocationBar title={m.users_editUser()} breadcrumbs={data.breadcrumbs} />

<UserForm {data} mode="edit" />
