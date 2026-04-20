<script lang="ts">
	// Types
	import type { PassengerLineItem } from '$lib/types';

	// Utils
	import { formatEuro } from '$lib/utils/currency';
	import { formatSlotTime, bookingToISODateTime } from '$lib/utils/datetime';
	import { countries } from '$lib/utils/countries';
	import { goto } from '$app/navigation';

	// Stores
	import { shoppingCartStore } from '$lib/stores/shoppingCart.svelte';

	// Components
	import PassengerBreakdown from '$lib/components/marketplace/ShoppingCart/PassengerBreakdown.svelte';
	import CartExpiryCallout from '$lib/components/marketplace/ShoppingCart/CartExpiryCallout.svelte';

	let contactFirstName = $state(shoppingCartStore.order?.contactFirstName ?? '');
	let contactLastName = $state(shoppingCartStore.order?.contactLastName ?? '');
	let contactEmail = $state(shoppingCartStore.order?.contactEmail ?? '');
	let contactPhone = $state(shoppingCartStore.order?.contactPhone ?? '');
	let contactNationalityCountryCode = $state(
		shoppingCartStore.order?.contactNationalityCountryCode ?? ''
	);
	let isSubmitting = $state(false);
	let submitError = $state<string | null>(null);

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	const isValid = $derived(
		contactFirstName.trim().length > 0 &&
			contactLastName.trim().length > 0 &&
			emailRegex.test(contactEmail.trim()) &&
			contactPhone.trim().length > 0 &&
			contactNationalityCountryCode.length > 0
	);

	async function handleSubmit() {
		if (!isValid || isSubmitting) return;
		isSubmitting = true;
		submitError = null;
		try {
			await shoppingCartStore.updateContactData({
				contactFirstName: contactFirstName.trim(),
				contactLastName: contactLastName.trim(),
				contactEmail: contactEmail.trim(),
				contactPhone: contactPhone.trim(),
				contactNationalityCountryCode
			});
			goto('/checkout-payment-data');
		} catch (e) {
			submitError = e instanceof Error ? e.message : 'Error al guardar los datos';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="wrapper">
	<div class="page-grid">
		<div class="col-content">
			<h1>Checkout Personal Data</h1>

			<CartExpiryCallout />

			<div class="co-personal-data">
				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
				>
					<div class="form-fields">
						<div class="field-group">
							<label for="contactFirstName">Nombre</label>
							<input
								id="contactFirstName"
								type="text"
								bind:value={contactFirstName}
								autocomplete="given-name"
								required
							/>
						</div>

						<div class="field-group">
							<label for="contactLastName">Apellidos</label>
							<input
								id="contactLastName"
								type="text"
								bind:value={contactLastName}
								autocomplete="family-name"
								required
							/>
						</div>

						<div class="field-group">
							<label for="contactEmail">Email</label>
							<input
								id="contactEmail"
								type="email"
								bind:value={contactEmail}
								autocomplete="email"
								required
							/>
						</div>

						<div class="field-group">
							<label for="contactPhone">Teléfono</label>
							<input
								id="contactPhone"
								type="tel"
								bind:value={contactPhone}
								autocomplete="tel"
								required
							/>
						</div>

						<div class="field-group">
							<label for="contactNationalityCountryCode">Nacionalidad</label>
							<select
								id="contactNationalityCountryCode"
								bind:value={contactNationalityCountryCode}
								required
							>
								<option value="" disabled>Selecciona un país</option>
								{#each countries as country (country.code)}
									<option value={country.code}>{country.label}</option>
								{/each}
							</select>
						</div>
					</div>

					{#if submitError}
						<p class="error-msg">{submitError}</p>
					{/if}

					<button type="submit" disabled={!isValid || isSubmitting}>
						{isSubmitting ? 'Guardando...' : 'Continuar con el pago'}
					</button>
				</form>
			</div>
		</div>
		<div class="col-sidebar pt-6">
			{#if shoppingCartStore.order?.bookings?.length}
				<p>Tienes ({shoppingCartStore.bookingCount}) planes en tu carrito</p>
				<ul>
					{#each shoppingCartStore.order.bookings as booking (booking.id)}
						{@const passengerItems = Object.values(
							(booking.passengers ?? []).reduce(
								(acc, p) => {
									if (!p.group) return acc;
									if (!acc[p.group])
										acc[p.group] = { group: p.group, count: 0, unitPrice: p.priceAtBooking ?? 0 };
									acc[p.group].count++;
									return acc;
								},
								{} as Record<string, PassengerLineItem>
							)
						)}
						<li>
							{#if booking.activityTitle || booking.optionTitle}
								<p>
									{#if booking.activityTitle}{booking.activityTitle}{booking.optionTitle
											? ' · '
											: ''}{/if}{booking.optionTitle ?? ''}
								</p>
							{/if}
							<p>booking_id: {booking.id}</p>
							<p>option_id: {booking.optionId}</p>
							{#if booking.date}
								<p>
									Fecha: {booking.date}
									{#if booking.startTime}{formatSlotTime(
											bookingToISODateTime(booking.date, booking.startTime)
										)}{/if}
								</p>
							{/if}
							<p>Estado: {booking.status}</p>
							<PassengerBreakdown items={passengerItems} />
							{#if booking.subtotalPrice != null}
								<p>{formatEuro(booking.subtotalPrice)}</p>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p>No hay bookings</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.co-personal-data {
		margin-top: 1.5rem;
	}

	.form-fields {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;

		& label {
			font-size: 0.875rem;
			font-weight: 500;
		}

		& input,
		& select {
			width: 100%;
			padding: 0.5rem 0.75rem;
			border: 1px solid oklch(var(--border, 0.7 0 0));
			border-radius: 0.375rem;
			font-size: 1rem;
			background-color: transparent;

			&:focus {
				outline: 2px solid oklch(var(--primary, 0.5 0.2 250));
				outline-offset: 2px;
			}
		}
	}

	.error-msg {
		margin-top: 0.75rem;
		color: oklch(0.55 0.2 25);
		font-size: 0.875rem;
	}

	button[type='submit'] {
		margin-top: 1.5rem;
		width: 100%;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		transition: opacity 0.15s;

		&:disabled {
			opacity: 0.4;
			cursor: not-allowed;
		}
	}
</style>
