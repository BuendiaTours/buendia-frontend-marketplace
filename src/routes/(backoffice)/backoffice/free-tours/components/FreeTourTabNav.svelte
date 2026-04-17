<script lang="ts">
	/**
	 * FreeTourTabNav — Horizontal tab navigation for free tour sub-routes.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import { FREE_TOUR_ROUTES } from '$lib/config/routes/backoffice/freeTours';
	import { Database, ChecklistMinimalistic, FolderCheck } from '$lib/icons/Linear';

	type Props = {
		freeTourId: string;
	};

	let { freeTourId }: Props = $props();

	const tabs = $derived([
		{
			label: m.freeTours_tabGeneral(),
			href: FREE_TOUR_ROUTES.edit(freeTourId),
			icon: Database
		},
		{
			label: m.freeTours_tabContent(),
			href: FREE_TOUR_ROUTES.content(freeTourId),
			icon: FolderCheck
		},
		{
			label: m.freeTours_tabEntries(),
			href: FREE_TOUR_ROUTES.entries(freeTourId),
			icon: ChecklistMinimalistic
		}
	]);

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

<nav class="flex items-end" aria-label="Free tour sections">
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
