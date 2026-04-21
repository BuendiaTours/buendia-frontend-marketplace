<script lang="ts">
	// Types
	import type { PassengerLineItem, BookingQuestion, PassengerGroup } from '$lib/types';

	// Utils
	import { formatEuro } from '$lib/utils/currency';
	import { formatSlotTime, bookingToISODateTime } from '$lib/utils/datetime';
	import { TelInput } from 'svelte-tel-input';
	import { countries, countryUnicodeFlags } from 'svelte-tel-input/assets';
	import type { CountryCode } from 'svelte-tel-input/types';
	import { goto } from '$app/navigation';
	import { SvelteMap } from 'svelte/reactivity';

	// Stores
	import { shoppingCartStore } from '$lib/stores/shoppingCart.svelte';

	// Components
	import PassengerBreakdown from '$lib/components/marketplace/ShoppingCart/PassengerBreakdown.svelte';
	import CartExpiryCallout from '$lib/components/marketplace/ShoppingCart/CartExpiryCallout.svelte';
	import BookingQuestionField from '$lib/components/marketplace/checkout/BookingQuestionField.svelte';

	import * as m from '$paraglide/messages';
	const messages = m as unknown as Record<string, () => string>;

	let contactFirstName = $state(shoppingCartStore.order?.contactFirstName ?? '');
	let contactLastName = $state(shoppingCartStore.order?.contactLastName ?? '');
	let contactEmail = $state(shoppingCartStore.order?.contactEmail ?? '');
	let country = $state<CountryCode | null>(
		(shoppingCartStore.order?.contactNationalityCountryCode as CountryCode) ?? 'ES'
	);
	let contactPhone = $state(shoppingCartStore.order?.contactPhone ?? '');
	let phoneValid = $state(false);
	let isSubmitting = $state(false);
	let submitError = $state<string | null>(null);

	// Booking questions state
	const questionsByOption = new SvelteMap<string, BookingQuestion[]>();
	const bookingAnswers = new SvelteMap<string, SvelteMap<string, string>>();
	const passengerAnswers = new SvelteMap<string, SvelteMap<string, string>>();
	let questionsLoading = $state(false);

	$effect(() => {
		const bookings = shoppingCartStore.order?.bookings;
		if (!bookings?.length) return;

		const uniqueOptionIds = [...new Set(bookings.map((b) => b.optionId).filter(Boolean))];
		questionsLoading = true;
		Promise.all(
			uniqueOptionIds.map((optionId) =>
				fetch(`/api/booking-questions/${optionId}`)
					.then((r) => r.json())
					.then((qs: BookingQuestion[]) => {
						questionsByOption.set(optionId, qs);
						bookings
							.filter((b) => b.optionId === optionId)
							.forEach((b) => {
								if (!bookingAnswers.has(b.id)) bookingAnswers.set(b.id, new SvelteMap());
								b.passengers?.forEach((p) => {
									if (!passengerAnswers.has(p.id)) passengerAnswers.set(p.id, new SvelteMap());
								});
							});
					})
			)
		).finally(() => (questionsLoading = false));
	});

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	const allRequiredQuestionsAnswered = $derived.by(() => {
		const bookings = shoppingCartStore.order?.bookings ?? [];
		for (const booking of bookings) {
			const questions = questionsByOption.get(booking.optionId) ?? [];
			const bAnswers = bookingAnswers.get(booking.id);
			for (const q of questions) {
				if (q.required !== 'REQUIRED') continue;
				if (q.target === 'BOOKING') {
					if (!bAnswers?.get(q.id)?.trim()) return false;
				} else {
					for (const passenger of booking.passengers ?? []) {
						if (!q.groupAge?.includes(passenger.group as PassengerGroup)) continue;
						if (!passengerAnswers.get(passenger.id)?.get(q.id)?.trim()) return false;
					}
				}
			}
		}
		return true;
	});

	const isValid = $derived(
		contactFirstName.trim().length > 0 &&
			contactLastName.trim().length > 0 &&
			emailRegex.test(contactEmail.trim()) &&
			phoneValid &&
			allRequiredQuestionsAnswered
	);

	async function handleSubmit() {
		if (!isValid || isSubmitting) return;
		isSubmitting = true;
		submitError = null;
		try {
			for (const booking of shoppingCartStore.order?.bookings ?? []) {
				const bAnswers = bookingAnswers.get(booking.id);
				const passengerPatches = (booking.passengers ?? [])
					.map((p) => {
						const pAnswers = passengerAnswers.get(p.id);
						if (!pAnswers?.size) return null;
						return {
							id: p.id,
							answers: [...pAnswers].map(([questionId, value]) => ({ questionId, values: [value] }))
						};
					})
					.filter(Boolean);

				if (bAnswers?.size || passengerPatches.length) {
					await fetch(`/api/bookings/${booking.id}`, {
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							...(bAnswers?.size
								? {
										bookingAnswers: [...bAnswers].map(([questionId, value]) => ({
											questionId,
											values: [value]
										}))
									}
								: {}),
							...(passengerPatches.length ? { passengers: passengerPatches } : {})
						})
					});
				}
			}

			await shoppingCartStore.updateContactData({
				contactFirstName: contactFirstName.trim(),
				contactLastName: contactLastName.trim(),
				contactEmail: contactEmail.trim(),
				contactPhone,
				contactNationalityCountryCode: country ?? ''
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
			<CartExpiryCallout />

			<h2 class="h2 mt-6">Datos personales</h2>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
			>
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<div class="flex flex-col gap-1.5">
						<label class="p-sm font-medium" for="contactFirstName">Nombre</label>
						<input
							class="input w-full"
							id="contactFirstName"
							type="text"
							bind:value={contactFirstName}
							autocomplete="given-name"
							required
						/>
					</div>

					<div class="flex flex-col gap-1.5">
						<label class="p-sm font-medium" for="contactLastName">Apellidos</label>
						<input
							class="input w-full"
							id="contactLastName"
							type="text"
							bind:value={contactLastName}
							autocomplete="family-name"
							required
						/>
					</div>

					<div class="flex flex-col gap-1.5">
						<label class="p-sm font-medium" for="contactEmail">Email</label>
						<input
							class="input w-full"
							id="contactEmail"
							type="email"
							bind:value={contactEmail}
							autocomplete="email"
							required
						/>
					</div>

					<div class="flex flex-col gap-1.5">
						<label class="p-sm font-medium" for="phone-country">Teléfono</label>
						<div class="flex gap-2">
							<select
								class="input w-auto shrink-0"
								id="phone-country"
								bind:value={country}
								aria-label="País"
							>
								<!-- eslint-disable svelte/no-at-html-tags -->
								{#each countries as c (c.iso2)}
									<option value={c.iso2}
										>{@html countryUnicodeFlags[c.iso2]} {c.name} (+{c.dialCode})</option
									>
								{/each}
								<!-- eslint-enable svelte/no-at-html-tags -->
							</select>
							<TelInput bind:country bind:value={contactPhone} bind:valid={phoneValid} required />
						</div>
						{#if !phoneValid && contactPhone.length > 0}
							<p class="p-sm mt-3 text-[oklch(0.55_0.2_25)]">Número de teléfono inválido</p>
						{/if}
					</div>
				</div>

				{#if questionsLoading}
					<p class="p-sm mt-4">Cargando preguntas...</p>
				{/if}

				{#if shoppingCartStore.order?.bookings?.length}
					<h2 class="h2 mt-6">Datos de la actividad</h2>
					<p class="p-lg">El proveedor requiere estos datos adicionales</p>

					{#each shoppingCartStore.order.bookings as booking (booking.id)}
						{@const questions = questionsByOption.get(booking.optionId) ?? []}
						{@const bookingLevelQs = questions.filter((q) => q.target === 'BOOKING')}
						{@const passengerLevelQs = questions.filter((q) => q.target === 'PASSENGER')}

						{#if bookingLevelQs.length || passengerLevelQs.length}
							<div class="mt-6 flex flex-col gap-4 rounded-xl border border-neutral-200 p-6">
								{#if booking.activityTitle || booking.optionTitle}
									<p class="h3">
										{booking.activityTitle ?? ''}{booking.optionTitle
											? ` · ${booking.optionTitle}`
											: ''}
									</p>
								{/if}

								{#if bookingLevelQs.length}
									<div class="flex flex-col gap-4">
										{#each bookingLevelQs as q (q.id)}
											{@const answers = bookingAnswers.get(booking.id) ?? new SvelteMap()}
											<BookingQuestionField
												{q}
												value={answers.get(q.id) ?? ''}
												onchange={(v: string) => {
													if (!bookingAnswers.has(booking.id))
														bookingAnswers.set(booking.id, new SvelteMap());
													bookingAnswers.get(booking.id)?.set(q.id, v);
												}}
											/>
										{/each}
									</div>
								{/if}

								{#if passengerLevelQs.length}
									{#each booking.passengers ?? [] as passenger, i (passenger.id ?? i)}
										{@const applicableQs = passengerLevelQs.filter((q) =>
											q.groupAge?.includes(passenger.group as PassengerGroup)
										)}
										{#if applicableQs.length}
											<div class="flex flex-col gap-4">
												<p class="h3">
													Asistente {i + 1} ({messages[
														`enum_passengerKind_${passenger.group}_name`
													]?.()})
												</p>
												{#each applicableQs as q (q.id)}
													{@const pAnswers = passengerAnswers.get(passenger.id) ?? new SvelteMap()}
													<BookingQuestionField
														{q}
														value={pAnswers.get(q.id) ?? ''}
														onchange={(v: string) => {
															if (!passengerAnswers.has(passenger.id))
																passengerAnswers.set(passenger.id, new SvelteMap());
															passengerAnswers.get(passenger.id)?.set(q.id, v);
														}}
													/>
												{/each}
											</div>
										{/if}
									{/each}
								{/if}
							</div>
						{/if}
					{/each}
				{/if}

				{#if submitError}
					<p class="p-sm mt-3 text-[oklch(0.55_0.2_25)]">{submitError}</p>
				{/if}

				<button
					class="e-button e-button-secondary mt-6 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
					type="submit"
					disabled={!isValid || isSubmitting}
				>
					{isSubmitting ? 'Guardando...' : 'Continuar con el pago'}
				</button>
			</form>
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
	:global(.svelte-tel-input) {
		flex: 1;
	}
</style>
