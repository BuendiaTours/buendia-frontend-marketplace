<script lang="ts">
	/**
	 * Booking detail page (read-only).
	 * Displays all booking data with a cancel action.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import {
		BOOKING_STATUS_OPTIONS,
		BOOKING_SYSTEM_OPTIONS,
		PAYMENT_METHOD_OPTIONS,
		PAYMENT_STATUS_OPTIONS
	} from '$lib/labels/bookings';
	import { BOOKING_ROUTES } from '$lib/config/routes/backoffice/bookings';
	import {
		Database,
		UsersGroupRounded,
		WalletMoney,
		MapPoint,
		Buildings3,
		UserRounded
	} from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();

	const booking = $derived(data.booking);
	const breadcrumbs = $derived(buildBreadcrumbs(page.url.pathname, { label: booking.legibleId }));

	const isCancellable = $derived(
		booking.status !== 'CANCELLED' && booking.status !== 'FAILED' && booking.status !== 'EXPIRED'
	);
	const hasContact = $derived(
		booking.orderContactName || booking.orderContactEmail || booking.orderContactPhone
	);

	function formatPrice(cents: number): string {
		return (cents / 100).toFixed(2) + ' €';
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	function formatDateTime(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getPaymentStatusClass(status: string): string {
		switch (status) {
			case 'COMPLETED':
				return 'badge-success';
			case 'PENDING':
			case 'ON_HOLD':
				return 'badge-warning';
			case 'FAILED':
			case 'CANCELLED':
				return 'badge-error';
			case 'REFUNDED':
				return 'badge-info';
			default:
				return 'badge-neutral';
		}
	}

	function getStatusClass(status: string): string {
		switch (status) {
			case 'CONFIRMED':
				return 'badge-success';
			case 'PENDING':
				return 'badge-warning';
			case 'RETRYING':
				return 'badge-warning';
			case 'FAILED':
				return 'badge-error';
			case 'CANCELLED':
				return 'badge-neutral';
			case 'EXPIRED':
				return 'badge-neutral';
			default:
				return 'badge-neutral';
		}
	}
</script>

<svelte:head>
	<title>{m.bookings_detailPageTitle()} - {booking.legibleId} - Backoffice</title>
</svelte:head>

<LocationBar title={m.bookings_detailPageTitle()} {breadcrumbs} />

<!-- Actions Bar -->
<div
	class="bnd-main-actions border-base-content/10 bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 border-t py-4"
>
	<a href={`${BOOKING_ROUTES.list}?${page.url.searchParams.toString()}`} class="btn btn-ghost">
		← {m.bookings_backToList()}
	</a>

	{#if isCancellable}
		<form method="POST" action="?/cancel" use:enhance>
			<button
				type="submit"
				class="btn btn-soft btn-error"
				use:confirmAction={{
					title: m.bookings_confirmCancelTitle(),
					message: m.bookings_confirmCancelMessage(),
					confirmText: m.bookings_cancelButton(),
					cancelText: m.common_cancel(),
					danger: true
				}}
			>
				{m.bookings_cancelButton()}
			</button>
		</form>
	{/if}
</div>

<div class="space-y-4">
	<!-- Main Data -->
	<FormAccordion name="booking-main-data" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>{m.bookings_sectionMainData()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.bookings_sectionMainDataDescription()}</p>
		{/snippet}
		{#snippet content()}
			<div class="md:col-span-4">
				<p class="text-base-content/50 text-sm">{m.bookings_labelLegibleId()}</p>
				<p class="font-semibold">{booking.legibleId}</p>
			</div>
			<div class="md:col-span-4">
				<p class="text-base-content/50 text-sm">{m.bookings_labelStatus()}</p>
				<span class="badge {getStatusClass(booking.status)}">
					{BOOKING_STATUS_OPTIONS.find((o) => o.id === booking.status)?.name ?? booking.status}
				</span>
			</div>
			<div class="md:col-span-4">
				<p class="text-base-content/50 text-sm">{m.bookings_labelSystem()}</p>
				<p>
					{BOOKING_SYSTEM_OPTIONS.find((o) => o.id === booking.bookingSystem)?.name ??
						booking.bookingSystem}
				</p>
			</div>
			<div class="md:col-span-4">
				<p class="text-base-content/50 text-sm">{m.bookings_labelDate()}</p>
				<p>{formatDate(booking.date)}</p>
			</div>
			<div class="md:col-span-4">
				<p class="text-base-content/50 text-sm">{m.bookings_labelStartTime()}</p>
				<p>{booking.startTime}</p>
			</div>
			<div class="md:col-span-4">
				<p class="text-base-content/50 text-sm">{m.bookings_labelConfirmationCode()}</p>
				<p>{booking.confirmationCode || m.bookings_labelNoData()}</p>
			</div>
			<div class="md:col-span-4">
				<p class="text-base-content/50 text-sm">{m.bookings_labelOrderId()}</p>
				<p class="font-mono text-sm break-all">{booking.orderId}</p>
			</div>
			<div class="md:col-span-4">
				<p class="text-base-content/50 text-sm">{m.bookings_labelActivityId()}</p>
				<p class="font-mono text-sm break-all">{booking.activityId}</p>
			</div>
			<div class="md:col-span-4">
				<p class="text-base-content/50 text-sm">{m.bookings_labelSubtotalPrice()}</p>
				<p class="font-semibold">{formatPrice(booking.subtotalPrice)}</p>
			</div>
			<div class="md:col-span-4">
				<p class="text-base-content/50 text-sm">{m.bookings_labelSubtotalCommission()}</p>
				<p>{formatPrice(booking.subtotalCommission)}</p>
			</div>
			<div class="md:col-span-4">
				<p class="text-base-content/50 text-sm">{m.bookings_labelCreatedAt()}</p>
				<p>{formatDateTime(booking.createdAt)}</p>
			</div>
			<div class="md:col-span-4">
				<p class="text-base-content/50 text-sm">{m.bookings_labelUpdatedAt()}</p>
				<p>{formatDateTime(booking.updatedAt)}</p>
			</div>
		{/snippet}
	</FormAccordion>

	<!-- Contact -->
	{#if hasContact}
		<FormAccordion name="booking-contact" open>
			{#snippet title()}
				<UserRounded class="size-6" />
				<span>{m.bookings_sectionContact()}</span>
			{/snippet}
			{#snippet asideContent()}
				<p class="text-xs">{m.bookings_sectionContactDescription()}</p>
			{/snippet}
			{#snippet content()}
				{#if booking.orderContactName}
					<div class="md:col-span-4">
						<p class="text-base-content/50 text-sm">{m.bookings_labelContactName()}</p>
						<p class="font-medium">{booking.orderContactName}</p>
					</div>
				{/if}
				{#if booking.orderContactEmail}
					<div class="md:col-span-4">
						<p class="text-base-content/50 text-sm">{m.bookings_labelContactEmail()}</p>
						<p>
							<a href="mailto:{booking.orderContactEmail}" class="link">
								{booking.orderContactEmail}
							</a>
						</p>
					</div>
				{/if}
				{#if booking.orderContactPhone}
					<div class="md:col-span-4">
						<p class="text-base-content/50 text-sm">{m.bookings_labelContactPhone()}</p>
						<p>
							<a href="tel:{booking.orderContactPhone}" class="link">
								{booking.orderContactPhone}
							</a>
						</p>
					</div>
				{/if}
			{/snippet}
		</FormAccordion>
	{/if}

	<!-- Passengers -->
	{#if booking.passengers.length > 0}
		<FormAccordion name="booking-passengers" open>
			{#snippet title()}
				<UsersGroupRounded class="size-6" />
				<span>{m.bookings_sectionPassengers()}</span>
			{/snippet}
			{#snippet asideContent()}
				<p class="text-xs">{m.bookings_sectionPassengersDescription()}</p>
			{/snippet}
			{#snippet content()}
				<div class="overflow-x-auto md:col-span-12">
					<table class="table-zebra table-sm table">
						<thead>
							<tr>
								<th>{m.bookings_labelPassengerGroup()}</th>
								<th>{m.bookings_labelPassengerMainPax()}</th>
								<th>{m.bookings_labelPassengerPrice()}</th>
								<th>{m.bookings_labelPassengerCommission()}</th>
							</tr>
						</thead>
						<tbody>
							{#each booking.passengers as passenger (passenger.id)}
								<tr>
									<td>{passenger.group}</td>
									<td>
										{#if passenger.isMainPax}
											<span class="badge badge-primary badge-sm">{m.bookings_yes()}</span>
										{:else}
											<span class="text-base-content/50">{m.bookings_no()}</span>
										{/if}
									</td>
									<td>{formatPrice(passenger.priceAtBooking)}</td>
									<td>{formatPrice(passenger.unitCommission)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/snippet}
		</FormAccordion>
	{/if}

	<!-- Payment -->
	{#if booking.payment}
		<FormAccordion name="booking-payment" open>
			{#snippet title()}
				<WalletMoney class="size-6" />
				<span>{m.bookings_sectionPayment()}</span>
			{/snippet}
			{#snippet asideContent()}
				<p class="text-xs">{m.bookings_sectionPaymentDescription()}</p>
			{/snippet}
			{#snippet content()}
				<div class="md:col-span-4">
					<p class="text-base-content/50 text-sm">{m.bookings_labelPaymentMethod()}</p>
					<p>
						{PAYMENT_METHOD_OPTIONS.find((o) => o.id === booking.payment?.paymentMethod)?.name ??
							booking.payment?.paymentMethod}
					</p>
				</div>
				<div class="md:col-span-4">
					<p class="text-base-content/50 text-sm">{m.bookings_labelPaymentStatus()}</p>
					<span class="badge {getPaymentStatusClass(booking.payment?.status ?? '')}">
						{PAYMENT_STATUS_OPTIONS.find((o) => o.id === booking.payment?.status)?.name ??
							booking.payment?.status}
					</span>
				</div>
				{#if booking.payment?.cardBrand}
					<div class="md:col-span-4">
						<p class="text-base-content/50 text-sm">{m.bookings_labelPaymentCard()}</p>
						<p>
							{booking.payment.cardBrand}
							{#if booking.payment.last4}
								<span class="text-base-content/50">•••• {booking.payment.last4}</span>
							{/if}
						</p>
					</div>
				{/if}
				{#if booking.payment?.externalId}
					<div class="md:col-span-12">
						<p class="text-base-content/50 text-sm">{m.bookings_labelPaymentExternalId()}</p>
						<p class="font-mono text-sm break-all">{booking.payment.externalId}</p>
					</div>
				{/if}
			{/snippet}
		</FormAccordion>
	{/if}

	<!-- Pickup Point -->
	{#if booking.pickupPoint}
		<FormAccordion name="booking-pickup" open>
			{#snippet title()}
				<MapPoint class="size-6" />
				<span>{m.bookings_sectionPickup()}</span>
			{/snippet}
			{#snippet asideContent()}
				<p class="text-xs">{m.bookings_sectionPickupDescription()}</p>
			{/snippet}
			{#snippet content()}
				<div class="md:col-span-4">
					<p class="text-base-content/50 text-sm">{m.bookings_labelPickupName()}</p>
					<p>{booking.pickupPoint?.name}</p>
				</div>
				{#if booking.pickupPoint?.address}
					<div class="md:col-span-4">
						<p class="text-base-content/50 text-sm">{m.bookings_labelPickupAddress()}</p>
						<p>{booking.pickupPoint?.address}</p>
					</div>
				{/if}
				{#if booking.pickupPoint?.city}
					<div class="md:col-span-4">
						<p class="text-base-content/50 text-sm">{m.bookings_labelPickupCity()}</p>
						<p>{booking.pickupPoint?.city}</p>
					</div>
				{/if}
			{/snippet}
		</FormAccordion>
	{/if}

	<!-- Hotel -->
	{#if booking.hotel}
		<FormAccordion name="booking-hotel" open>
			{#snippet title()}
				<Buildings3 class="size-6" />
				<span>{m.bookings_labelHotel()}</span>
			{/snippet}
			{#snippet content()}
				<p class="md:col-span-12">{booking.hotel?.name}</p>
			{/snippet}
		</FormAccordion>
	{/if}
</div>
