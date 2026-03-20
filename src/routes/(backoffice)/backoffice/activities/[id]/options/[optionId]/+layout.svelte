<script lang="ts">
	/**
	 * Layout for activity option [optionId] sub-routes.
	 * Nested under [id] layout — inherits activity breadcrumbs and tab nav.
	 * Provides back button and option-specific tab navigation.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';
	import { ACTIVITY_ROUTES } from '$lib/config/routes/backoffice/activities';
	import { Database } from '$lib/icons/Linear';

	let { data, children }: LayoutProps = $props();

	const tabs = $derived([
		{
			label: m.activities_optionTabGeneral(),
			href: ACTIVITY_ROUTES.optionEdit(data.activity.id, data.option.id),
			icon: Database
		}
	]);

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

<svelte:head>
	<title>{m.activities_optionEditPageTitle()} - Backoffice</title>
</svelte:head>

<div class="mb-4">
	<a href={ACTIVITY_ROUTES.options(data.activity.id)} class="btn btn-ghost btn-sm">
		{m.activities_optionBackToOptions()}
	</a>
</div>

<nav class="flex items-end" aria-label="Option sections">
	{#each tabs as tab (tab.href)}
		<a
			href={tab.href}
			class="flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors
				{isActive(tab.href)
				? 'border-base-300 bg-base-100 text-base-content z-10 -mb-px rounded-t-lg border border-b-transparent'
				: 'border-base-300 text-base-content/50 hover:text-base-content/80 border-b'}"
			aria-current={isActive(tab.href) ? 'page' : undefined}
		>
			<tab.icon class="size-4" />
			<span>{tab.label}</span>
		</a>
	{/each}
	<div class="border-base-300 flex-1 border-b"></div>
</nav>

<div class="border-base-300 bg-base-100 rounded-b-lg border border-t-0 p-6">
	{@render children()}
</div>
