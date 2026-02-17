<script lang="ts">
	import * as m from '$paraglide/messages';
	import type { PageData } from './$types';
	import UserForm from '../components/UserForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{m.users_newUserPageTitle()}</title>
</svelte:head>

<LocationBar title={m.users_newUser()} breadcrumbs={data.breadcrumbs} />

<UserForm {data} mode="create" />
