<script lang="ts">
	/**
	 * Layout for activity [id] sub-routes.
	 * Provides LocationBar, tab navigation, and toast system shared across tabs.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';
	import ActivityTabNav from '../components/ActivityTabNav.svelte';
	import { createToaster, melt } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { CheckCircle, Close as CloseIcon } from '$lib/icons/Linear';
	import { setContext } from 'svelte';

	let { data, children }: LayoutProps = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, {
			label: data.activity.title || m.activities_breadcrumbResource()
		})
	);

	type ToastData = { title: string; description: string; type: 'success' | 'error' };

	const {
		elements: { content, title, description, close },
		helpers: { addToast },
		states: { toasts },
		actions: { portal }
	} = createToaster<ToastData>();

	function handleToast(toast: { data: ToastData }) {
		addToast(toast);
	}

	setContext('activityToast', handleToast);

	let locationCount = $state(
		(data.activity.locations?.length ?? 0) + (data.activity.attractions?.length ?? 0)
	);
	let mealCount = $state(data.activity.meals?.length ?? 0);
	let addonCount = $state(data.addons?.length ?? 0);

	setContext('updateLocationCount', (count: number) => {
		locationCount = count;
	});
	setContext('updateMealCount', (count: number) => {
		mealCount = count;
	});
	setContext('updateAddonCount', (count: number) => {
		addonCount = count;
	});
</script>

<svelte:head>
	<title>{m.activities_editPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.activities_editPageTitle()} {breadcrumbs} />

<ActivityTabNav activityId={data.activity.id} {locationCount} {mealCount} {addonCount} />

<div class="border-base-300 bg-base-100 rounded-b-lg border border-t-0 p-6">
	{@render children()}
</div>

<div
	class="fixed top-0 right-0 z-50 m-4 flex flex-col items-end gap-2 md:top-auto md:bottom-0"
	use:portal
>
	{#each $toasts as { id, data } (id)}
		<div
			use:melt={$content(id)}
			animate:flip={{ duration: 500 }}
			in:fly={{ duration: 150, x: '100%' }}
			out:fly={{ duration: 150, x: '100%' }}
			class="rounded-lg shadow-lg {data.type === 'success'
				? 'bg-success text-success-content'
				: 'bg-error text-error-content'}"
		>
			<div
				class="relative flex w-[24rem] max-w-[calc(100vw-2rem)] items-center justify-between gap-4 p-5"
			>
				<div class="flex items-start gap-3">
					<CheckCircle class="size-6 shrink-0" />
					<div class="flex-1">
						<h3 use:melt={$title(id)} class="text-md font-semibold">{data.title}</h3>
						<div use:melt={$description(id)} class="mt-1 text-sm opacity-90">
							{data.description}
						</div>
					</div>
				</div>
				<button
					use:melt={$close(id)}
					class="absolute top-2 right-2 grid size-6 cursor-pointer place-items-center rounded-full hover:bg-black/10"
				>
					<CloseIcon class="size-5" />
				</button>
			</div>
		</div>
	{/each}
</div>
