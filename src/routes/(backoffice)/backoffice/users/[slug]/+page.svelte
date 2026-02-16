<script lang="ts">
	import type { User } from '$core/users/types';
	import { page } from '$app/state';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { USER_ROUTES } from '$lib/config/routes/backoffice/users';
	import * as m from '$paraglide/messages';

	let { data }: { data: { user: User } } = $props();
	const user = $derived(data.user);
</script>

<svelte:head>
	<title>{user.name} - {m.users_userPageTitle()}</title>
</svelte:head>

<div
	class="bnd-main-actions border-base-content/10 bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 border-t py-4"
>
	<a href={buildUrlWithFilters(USER_ROUTES.list, page.url.searchParams)} class="link">
		{m.users_backToList()}
	</a>

	<div class="flex gap-2">
		<a
			href={buildUrlWithFilters(USER_ROUTES.edit(user.id), page.url.searchParams)}
			class="btn btn-outline btn-primary"
		>
			{m.users_editUser()}
		</a>
	</div>
</div>

<div class="card mt-4 p-6">
	<div class="grid grid-cols-2 gap-4">
		<div>
			<span class="text-base-content/50 text-sm">{m.users_id()}</span>
			<p class="font-mono text-sm">{user.id}</p>
		</div>
		<div>
			<span class="text-base-content/50 text-sm">{m.users_name()}</span>
			<p>{user.name}</p>
		</div>
		<div>
			<span class="text-base-content/50 text-sm">{m.users_email()}</span>
			<p>{user.email}</p>
		</div>
		<div>
			<span class="text-base-content/50 text-sm">{m.users_phone()}</span>
			<p>{user.phone}</p>
		</div>
		<div>
			<span class="text-base-content/50 text-sm">{m.users_kind()}</span>
			<p><span class="badge">{user.kind}</span></p>
		</div>
		<div>
			<span class="text-base-content/50 text-sm">{m.users_status()}</span>
			<p>
				<span
					class="badge"
					class:badge-success={user.status === 'ACTIVE'}
					class:badge-warning={user.status === 'SUSPENDED'}
					class:badge-error={user.status === 'INACTIVE'}
				>
					{user.status}
				</span>
			</p>
		</div>
		{#if user.roles && user.roles.length > 0}
			<div class="col-span-2">
				<span class="text-base-content/50 text-sm">{m.users_roles()}</span>
				<div class="mt-1 flex gap-2">
					{#each user.roles as role, i (role + i)}
						<span class="badge badge-outline">{role}</span>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
