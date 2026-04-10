<script lang="ts">
	/**
	 * Layout for activity option [optionId] sub-routes.
	 * Nested under [id] layout — inherits activity breadcrumbs and tab nav.
	 * Provides back button and option-specific tab navigation.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { setContext } from 'svelte';
	import type { LayoutProps } from './$types';
	import { ACTIVITY_ROUTES } from '$lib/config/routes/backoffice/activities';
	import { OptionStatus } from '$core/activity-options/enums';
	import { OPTION_STATUS_OPTIONS } from '$lib/labels/activityOptions';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import { Database, LinkRound, MapPoint, Ticket } from '$lib/icons/Linear';

	let { data, children }: LayoutProps = $props();

	// svelte-ignore state_referenced_locally
	let pickupCount = $state(data.option.pickupPlaces?.length ?? 0);
	// svelte-ignore state_referenced_locally
	let ticketCount = $state(
		data.option.ticketKind === 'INDIVIDUAL'
			? (data.option.individualTickets?.length ?? 0)
			: data.option.ticketKind === 'GROUP'
				? (data.option.groupTickets?.length ?? 0)
				: 0
	);

	const optionStatus = $derived(data.option.status as OptionStatus);
	const statusLabel = $derived(
		OPTION_STATUS_OPTIONS.find((o) => o.id === optionStatus)?.name ?? optionStatus
	);
	const statusBadgeClass = $derived.by(() => {
		switch (optionStatus) {
			case OptionStatus.PUBLISHED:
				return 'badge-success';
			case OptionStatus.DRAFT:
				return 'badge-warning';
			case OptionStatus.UNPUBLISHED:
				return 'badge-neutral';
			default:
				return 'badge-ghost';
		}
	});
	const canPublish = $derived(
		optionStatus === OptionStatus.DRAFT ||
			optionStatus === OptionStatus.UNPUBLISHED ||
			optionStatus === OptionStatus.APPROVED
	);
	const canUnpublish = $derived(optionStatus === OptionStatus.PUBLISHED);
	const changeStatusAction = $derived(
		`${ACTIVITY_ROUTES.optionEdit(data.activity.id, data.option.id)}?/changeStatus`
	);

	setContext('updatePickupCount', (count: number) => {
		pickupCount = count;
	});
	setContext('updateTicketCount', (count: number) => {
		ticketCount = count;
	});

	const tabs = $derived([
		{
			label: m.activities_optionTabGeneral(),
			href: ACTIVITY_ROUTES.optionEdit(data.activity.id, data.option.id),
			icon: Database,
			badge: undefined as number | undefined
		},
		{
			label: m.activities_optionTabTickets(),
			href: ACTIVITY_ROUTES.optionTickets(data.activity.id, data.option.id),
			icon: Ticket,
			badge: ticketCount > 0 ? ticketCount : undefined
		},
		{
			label: m.activities_optionTabPickup(),
			href: ACTIVITY_ROUTES.optionPickup(data.activity.id, data.option.id),
			icon: MapPoint,
			badge: pickupCount > 0 ? pickupCount : undefined
		},
		{
			label: m.activities_optionTabBookingSystem(),
			href: ACTIVITY_ROUTES.optionBookingSystem(data.activity.id, data.option.id),
			icon: LinkRound,
			badge: undefined as number | undefined
		}
	]);

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

<svelte:head>
	<title>{m.activities_optionEditPageTitle()} - Backoffice</title>
</svelte:head>

<div class="mb-4 flex items-center gap-3">
	<a href={ACTIVITY_ROUTES.options(data.activity.id)} class="btn btn-ghost btn-sm">
		{m.activities_optionBackToOptions()}
	</a>
	<span class="badge badge-lg {statusBadgeClass}">{statusLabel}</span>
	{#if canPublish || canUnpublish}
		<form method="POST" action={changeStatusAction} class="ml-auto" use:enhance>
			{#if canPublish}
				<input type="hidden" name="action" value="publish" />
				<button
					type="submit"
					class="btn btn-soft btn-success"
					use:confirmAction={{
						title: m.activities_optionConfirmPublishTitle(),
						message: m.activities_optionConfirmPublishMessage(),
						confirmText: m.activities_optionPublishButton(),
						cancelText: m.common_cancel(),
						danger: false
					}}
				>
					{m.activities_optionPublishButton()}
				</button>
			{:else}
				<input type="hidden" name="action" value="unpublish" />
				<button
					type="submit"
					class="btn btn-soft btn-warning"
					use:confirmAction={{
						title: m.activities_optionConfirmUnpublishTitle(),
						message: m.activities_optionConfirmUnpublishMessage(),
						confirmText: m.activities_optionUnpublishButton(),
						cancelText: m.common_cancel(),
						danger: true
					}}
				>
					{m.activities_optionUnpublishButton()}
				</button>
			{/if}
		</form>
	{/if}
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
			{#if tab.badge !== undefined}
				<span class="badge badge-sm badge-neutral">{tab.badge}</span>
			{/if}
		</a>
	{/each}
	<div class="border-base-300 flex-1 border-b"></div>
</nav>

<div class="border-base-300 bg-base-100 rounded-b-lg border border-t-0 p-6">
	{@render children()}
</div>
