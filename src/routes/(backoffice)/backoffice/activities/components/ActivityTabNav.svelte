<script lang="ts">
	/**
	 * ActivityTabNav — Horizontal tab navigation for activity sub-routes.
	 * Custom lifted-tab style: the active tab connects to the content panel below.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import { ACTIVITY_ROUTES } from '$lib/config/routes/backoffice/activities';
	import { Database, FolderCheck, MapPoint, Tuning } from '$lib/icons/Linear';

	type Props = {
		activityId: string;
		optionCount?: number;
	};

	let { activityId, optionCount = 0 }: Props = $props();

	const tabs = $derived([
		{
			label: m.activities_tabGeneral(),
			href: ACTIVITY_ROUTES.edit(activityId),
			icon: Database,
			badge: undefined as number | undefined
		},
		{
			label: m.activities_tabLocations(),
			href: ACTIVITY_ROUTES.locations(activityId),
			icon: MapPoint,
			badge: undefined as number | undefined
		},
		{
			label: m.activities_tabContentBlocks(),
			href: ACTIVITY_ROUTES.contentBlocks(activityId),
			icon: FolderCheck,
			badge: undefined as number | undefined
		},
		{
			label: m.activities_tabOptions(),
			href: ACTIVITY_ROUTES.options(activityId),
			icon: Tuning,
			badge: optionCount > 0 ? optionCount : undefined
		}
	]);

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

<nav class="flex items-end" aria-label="Activity sections">
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
			{#if tab.badge !== undefined}
				<span class="badge badge-sm badge-neutral">{tab.badge}</span>
			{/if}
		</a>
	{/each}
	<div class="border-base-300 flex-1 border-b"></div>
</nav>
