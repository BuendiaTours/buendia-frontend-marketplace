<script lang="ts">
	// Types
	import type { PassengerLineItem, BookingQuestion, PassengerGroup } from '$lib/types';

	// Utils
	import { countries } from 'svelte-tel-input/assets';
	import { formatEuro } from '$lib/utils/currency';
	import { formatSlotTime, bookingToISODateTime, formatActivityDate } from '$lib/utils/datetime';
	import { goto } from '$app/navigation';
	import { SvelteMap } from 'svelte/reactivity';
	import { TelInput } from 'svelte-tel-input';
	import type { CountryCode } from 'svelte-tel-input/types';

	// Stores
	import { shoppingCartStore } from '$lib/stores/shoppingCart.svelte';

	// Components
	import PassengerBreakdown from '$lib/components/marketplace/ShoppingCart/PassengerBreakdown.svelte';
	import CartExpiryCallout from '$lib/components/marketplace/ShoppingCart/CartExpiryCallout.svelte';
	import BookingQuestionField from '$lib/components/marketplace/checkout/BookingQuestionField.svelte';
	import CheckoutCard from '$lib/components/marketplace/checkout/CheckoutCard.svelte';

	// i18n
	import * as m from '$paraglide/messages';
	import { formatPassengersFromBooking } from '$lib/utils/passengers';
	import Steps from '$lib/components/marketplace/Steps.svelte';
	import DebugBookingQuestionFields from '$lib/components/marketplace/checkout/DebugBookingQuestionFields.svelte';

	const messages = m as unknown as Record<string, () => string>;

	const isoToFlag = (iso2: string) =>
		String.fromCodePoint(...[...iso2.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

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
	<div class="page-grid gap-x-12">
		<div class="col-content">
			<CartExpiryCallout />

			<Steps
				wrapperClass="mt-6"
				items={[
					{
						text: 'Datos personales',
						url: '/checkout-personal-data',
						active: true
					},
					{
						text: 'Datos de pago',
						url: '/checkout-payment-data',
						disabled: !isValid
					}
				]}
			/>

			<h2 class="h2 mt-6">Datos personales</h2>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
			>
				<div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
					<div class="flex flex-col">
						<label class="p-base" for="contactFirstName">Nombre</label>
						<input
							class="input input-lg w-full"
							id="contactFirstName"
							type="text"
							bind:value={contactFirstName}
							autocomplete="given-name"
							required
						/>
					</div>

					<div class="flex flex-col">
						<label class="p-base" for="contactLastName">Apellidos</label>
						<input
							class="input input-lg w-full"
							id="contactLastName"
							type="text"
							bind:value={contactLastName}
							autocomplete="family-name"
							required
						/>
					</div>

					<div class="flex flex-col">
						<label class="p-base" for="contactEmail">Email</label>
						<input
							class="input input-lg w-full"
							id="contactEmail"
							type="email"
							bind:value={contactEmail}
							autocomplete="email"
							required
						/>
					</div>

					<div class="flex flex-col">
						<label class="p-base" for="phone-country">Teléfono</label>
						<div class="flex items-center gap-0 overflow-hidden p-0">
							<select
								class="select select-lg !w-[140px] shrink-0 !rounded-r-none !border-r-0"
								id="phone-country"
								bind:value={country}
								aria-label="País"
							>
								{#each countries as c (c.iso2)}
									<option value={c.iso2} label="{isoToFlag(c.iso2)} {c.iso2} (+{c.dialCode})"
										>{c.name}</option
									>
								{/each}
							</select>
							<TelInput
								class="input input-lg w-full !rounded-l-none"
								bind:country
								bind:value={contactPhone}
								bind:valid={phoneValid}
								required
							/>
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
					<p class="p-lg mt-2">El proveedor requiere estos datos adicionales</p>

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
												<p class="h3 mt-2">
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

			<DebugBookingQuestionFields />
		</div>

		<div class="col-sidebar pt-4">
			{#if shoppingCartStore.order?.bookings?.length}
				<p class="h3">Tienes ({shoppingCartStore.bookingCount}) planes en tu carrito</p>

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
					<CheckoutCard
						variant="IS_BUENDIA"
						image="https://dummyimage.com/140x140/000/fff.jpg"
						title={[booking.activityTitle, booking.optionTitle].filter(Boolean).join(' · ')}
						rating={4.7}
						opinions={432}
						currentPrice={booking.subtotalPrice ?? undefined}
						previousPrice={booking.previousPrice ?? undefined}
						{passengerItems}
						list={[
							{
								icon: 'Ticket',
								text: 'Con entradas al Palacio da Pena y Quinta da Regaleira'
							},
							...(booking.passengers?.length
								? [{ icon: 'User', text: formatPassengersFromBooking(booking.passengers) ?? '' }]
								: []),
							...(booking.activityDatetime
								? [{ icon: 'Calendar', text: formatActivityDate(booking.activityDatetime) }]
								: []),
							...(booking.startTime ? [{ icon: 'ClockCircle', text: booking.startTime }] : []),
							{
								icon: 'CheckCircle',
								iconColor: 'text-green-500',
								text: 'Cancelación gratuita hasta el inicio de la actividad'
							}
						]}
					></CheckoutCard>
				{/each}

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
			{:else}
				<p>No hay bookings</p>
			{/if}
		</div>
	</div>
</div>

<details class="mt-12">
	<summary>booking questions debug</summary>
	<pre>{JSON.stringify(
			Object.fromEntries([...questionsByOption.entries()].map(([optionId, qs]) => [optionId, qs])),
			null,
			2
		)}</pre>
</details>

<details class="mt-4">
	<summary>shoppingCart debug</summary>
	<pre>{JSON.stringify(
			{
				orderId: shoppingCartStore.orderId,
				userId: shoppingCartStore.userId,
				isLoading: shoppingCartStore.isLoading,
				error: shoppingCartStore.error,
				bookingCount: shoppingCartStore.bookingCount,
				totalAmount: shoppingCartStore.totalAmount,
				order: $state.snapshot(shoppingCartStore.order)
			},
			null,
			2
		)}</pre>
</details>

<style>
	:global(.svelte-tel-input) {
		flex: 1;
		border: none !important;
		outline: none !important;
		box-shadow: none !important;
		background: transparent;
		padding-left: 0.75rem;
	}
</style>
