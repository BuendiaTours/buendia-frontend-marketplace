<script lang="ts">
	// Types
	import type { BookingQuestion, PassengerGroup } from '$lib/types';

	// Utils
	import { countries } from 'svelte-tel-input/assets';
	import { goto } from '$app/navigation';
	import { SvelteMap } from 'svelte/reactivity';
	import { TelInput } from 'svelte-tel-input';
	import type { CountryCode } from 'svelte-tel-input/types';

	// Validation
	import { z } from 'zod';
	import { contactSchema } from './schemas/contact.schema';
	import {
		buildBookingQuestionsSchema,
		buildFlatAnswersObject,
		bookingKey,
		passengerKey
	} from './schemas/bookingQuestions.schema';

	// Stores
	import { shoppingCartStore } from '$lib/stores/shoppingCart.svelte';

	// Components
	import CartExpiryCallout from '$lib/components/marketplace/ShoppingCart/CartExpiryCallout.svelte';
	import BookingQuestionField from '$lib/components/marketplace/checkout/BookingQuestionField.svelte';
	import CheckoutSidebarResume from '$lib/components/marketplace/checkout/CheckoutSidebarResume.svelte';
	import TotalResume from '$lib/components/marketplace/checkout/TotalResume.svelte';

	// i18n
	import * as m from '$paraglide/messages';
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
	let showErrors = $state(false);

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

	const contactParseResult = $derived(
		contactSchema.safeParse({
			firstName: contactFirstName,
			lastName: contactLastName,
			email: contactEmail,
			countryCode: country ?? '',
			phoneValid
		})
	);

	const contactErrors = $derived(
		showErrors && !contactParseResult.success
			? (z.flattenError(contactParseResult.error).fieldErrors as Record<string, string[]>)
			: {}
	);

	const bookingQuestionsSchema = $derived.by(() =>
		buildBookingQuestionsSchema(shoppingCartStore.order?.bookings ?? [], questionsByOption)
	);

	const questionsParseResult = $derived.by(() =>
		bookingQuestionsSchema.safeParse(
			buildFlatAnswersObject(
				shoppingCartStore.order?.bookings ?? [],
				questionsByOption,
				bookingAnswers,
				passengerAnswers
			)
		)
	);

	const questionErrors = $derived(
		showErrors && !questionsParseResult.success
			? (z.flattenError(questionsParseResult.error).fieldErrors as Record<string, string[]>)
			: {}
	);

	const isValid = $derived(contactParseResult.success && questionsParseResult.success);

	async function handleSubmit() {
		showErrors = true;
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
			{#if shoppingCartStore.order?.bookings?.length}
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
							<label class="p-base" for="contactFirstName"
								>Nombre <span class="text-salmon-strong font-bold">*</span></label
							>
							<input
								class="input input-lg w-full"
								id="contactFirstName"
								type="text"
								bind:value={contactFirstName}
								autocomplete="given-name"
								required
							/>
							{#if contactErrors['firstName']?.[0]}
								<p class="p-sm mt-1 text-[oklch(0.55_0.2_25)]">{contactErrors['firstName'][0]}</p>
							{/if}
						</div>

						<div class="flex flex-col">
							<label class="p-base" for="contactLastName"
								>Apellidos <span class="text-salmon-strong font-bold">*</span></label
							>
							<input
								class="input input-lg w-full"
								id="contactLastName"
								type="text"
								bind:value={contactLastName}
								autocomplete="family-name"
								required
							/>
							{#if contactErrors['lastName']?.[0]}
								<p class="p-sm mt-1 text-[oklch(0.55_0.2_25)]">{contactErrors['lastName'][0]}</p>
							{/if}
						</div>

						<div class="flex flex-col">
							<label class="p-base" for="contactEmail"
								>Email <span class="text-salmon-strong font-bold">*</span></label
							>
							<input
								class="input input-lg w-full"
								id="contactEmail"
								type="email"
								bind:value={contactEmail}
								autocomplete="email"
								required
							/>
							{#if contactErrors['email']?.[0]}
								<p class="p-sm mt-1 text-[oklch(0.55_0.2_25)]">{contactErrors['email'][0]}</p>
							{/if}
						</div>

						<div class="flex flex-col">
							<label class="p-base" for="phone-country"
								>Teléfono <span class="text-salmon-strong font-bold">*</span></label
							>
							<div class="flex items-center gap-0 overflow-hidden p-0">
								<select
									class="select select-lg !w-[148px] shrink-0 !rounded-r-none !border-r-0"
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
							{#if contactErrors['phoneValid']?.[0]}
								<p class="p-sm mt-3 text-[oklch(0.55_0.2_25)]">{contactErrors['phoneValid'][0]}</p>
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
													error={questionErrors[bookingKey(booking.id, q.id)]?.[0]}
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
														{@const pAnswers =
															passengerAnswers.get(passenger.id) ?? new SvelteMap()}
														<BookingQuestionField
															{q}
															value={pAnswers.get(q.id) ?? ''}
															onchange={(v: string) => {
																if (!passengerAnswers.has(passenger.id))
																	passengerAnswers.set(passenger.id, new SvelteMap());
																passengerAnswers.get(passenger.id)?.set(q.id, v);
															}}
															error={questionErrors[passengerKey(passenger.id, q.id)]?.[0]}
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

					<TotalResume
						variant="IN_A_ROW"
						bookingCount={shoppingCartStore.bookingCount}
						totalAmount={shoppingCartStore.totalAmount}
						wrapperClass="mt-6"
					>
						{#snippet actions()}
							<button
								class="e-button e-button-secondary w-full transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
								type="submit"
								disabled={!isValid || isSubmitting}
							>
								{isSubmitting ? 'Guardando...' : 'Continuar con el pago'}
							</button>
						{/snippet}
					</TotalResume>
				</form>

				<!-- <DebugBookingQuestionFields /> -->
			{:else}
				<p class="p-base">No hay reservas para mostrar.</p>
			{/if}
		</div>

		<div class="col-sidebar">
			<CheckoutSidebarResume />
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
