<script lang="ts">
	import { ClockCircle, ByBuendia, CalendarCheck, MoneyBack } from '$lib/icons/Linear';
	import type { ActivityOption } from '$lib/types';

	type Props = {
		title?: string;
		options: ActivityOption[];
		value?: string | null;
		selectedTime?: string | null;
		onchange?: (option: ActivityOption) => void;
		wrapperClass?: string;
	};

	let {
		title,
		options,
		value = $bindable(null),
		selectedTime = $bindable(null),
		onchange,
		wrapperClass
	}: Props = $props();

	if (selectedTime === null && value !== null) {
		const currentOption = options.find((o) => o.id === value);
		selectedTime = currentOption?.pickupLocations[0]?.timeOfDay ?? null;
	}

	function select(option: ActivityOption) {
		value = option.id;
		selectedTime = option.pickupLocations[0]?.timeOfDay ?? null;
		onchange?.(option);
	}
</script>

<div class="flex flex-col gap-5 {wrapperClass}">
	<div class="flex flex-col gap-2">
		<h2 class="h2 text-neutral-800">
			{#if title}
				{title}
			{:else}
				{options.length} {options.length === 1 ? 'opción disponible' : 'opciones disponibles'}
			{/if}
		</h2>
		{#if !title}
			<p class="p-lg text-neutral-700">
				Todas las opciones incluyen las mismas condiciones by buendía.
			</p>
		{/if}
	</div>
	{#each options as option (option.id)}
		{@const selected = value === option.id}
		<div
			class="
        flex flex-col gap-5 border-[2px] border-solid lg:relative
        lg:flex-row lg:gap-6
        {selected
				? 'border-violet-500'
				: option.disabled
					? 'border-neutral-200'
					: 'cursor-pointer border-neutral-200'}
        rounded-lg p-4 lg:p-6
      "
			role="radio"
			aria-checked={selected}
			tabindex="0"
			onclick={!option.disabled ? () => select(option) : undefined}
			onkeydown={!option.disabled ? (e) => e.key === 'Enter' && select(option) : undefined}
		>
			<div class="flex w-full flex-col gap-5 lg:gap-6">
				<div class="flex flex-col gap-2">
					<div class="flex justify-between gap-5">
						<p class="h2">{option.title}</p>
						<div
							class="
              {option.disabled ? '' : 'lg:absolute lg:top-7 lg:right-6'}
              flex h-5 w-5 shrink-0 grow-0
              basis-5 items-center justify-center
              border border-solid
              {selected
								? 'border-violet-500'
								: option.disabled
									? 'border-neutral-300 bg-neutral-200'
									: 'border-neutral-300'}
              rounded-full
            "
						>
							{#if selected}
								<div class="h-2 w-2 rounded-full bg-violet-500"></div>
							{/if}
						</div>
					</div>
					{#if option.description}
						<p class="p-base mb-1 text-neutral-600">{option.description}</p>
					{/if}
					{#if option.disabled}
						<div class="flex flex-col gap-4">
							<div class="text-error-500 p-base rounded-lg bg-neutral-100 p-3">
								Solo hay 4 plazas disponibles para esta fecha.
							</div>
							<div class="flex flex-col gap-2">
								<p class="p-sm font-bold text-neutral-800">Próximas fechas disponibles:</p>
								<div class="flex flex-wrap gap-2">
									<button
										class="p-base cursor-pointer rounded-lg border border-solid border-neutral-300 px-4 py-3 text-neutral-800"
									>
										Mar <b class="text-neutral-700">17 de ago</b>
									</button>
									<button
										class="p-base cursor-pointer rounded-lg border border-solid border-neutral-300 px-4 py-3 text-neutral-800"
									>
										Mar <b class="text-neutral-700">18 de ago</b>
									</button>
									<button
										class="p-base cursor-pointer rounded-lg border border-solid border-neutral-300 px-4 py-3 text-neutral-800"
									>
										Mar <b class="text-neutral-700">19 de ago</b>
									</button>
								</div>
							</div>
						</div>
					{/if}
				</div>
				{#if !option.disabled}
					<div class="flex flex-col {selected ? 'gap-5 lg:gap-6' : 'gap-2'}">
						{#if option.duration.quantity && option.duration.unit}
							<p class="p-base flex gap-2 font-bold text-neutral-800">
								<ClockCircle class="size-6 flex-shrink-0 flex-grow-0 basis-6" />
								Duración: {option.duration.quantity}
								{option.duration.unit}
							</p>
						{/if}
						{#if selected && option.pickupLocations.length > 0}
							<div class="flex flex-col gap-2">
								<p class="p font-bold text-neutral-800">Selecciona la hora de inicio</p>
								<div class="flex flex-wrap gap-2">
									{#each option.pickupLocations as loc (loc.id)}
										<button
											class="rounded-lg border border-solid px-4 py-3 font-bold {selectedTime ===
											loc.timeOfDay
												? 'border-violet-500 bg-violet-500 text-white'
												: 'cursor-pointer border-neutral-300 bg-white text-neutral-800'}"
											type="button"
											aria-pressed={selectedTime === loc.timeOfDay}
											onclick={(e) => {
												e.stopPropagation();
												selectedTime = loc.timeOfDay;
											}}
										>
											{loc.timeOfDay}
										</button>
									{/each}
								</div>
							</div>
						{/if}
						<div class="flex flex-col gap-2">
							<p class="p-base flex gap-2 font-bold text-neutral-800">
								<ByBuendia class="h-6 shrink-0 grow-0 basis-6" />
								{#if selected}
									Condiciones by buendía
								{:else}
									Incluye condiciones by buendía
								{/if}
							</p>
							{#if selected}
								<p class="p-base flex gap-2 text-neutral-800">
									<CalendarCheck class="h-6 shrink-0 grow-0 basis-6" />
									Cancela sin coste hasta 1 minuto antes del inicio
								</p>
								<p class="p-base flex gap-2 text-neutral-800">
									<MoneyBack class="h-6 shrink-0 grow-0 basis-6" />
									Te devolvemos el dinero si no te gusta. Sin explicaciones
								</p>
							{/if}
						</div>
					</div>
				{/if}
			</div>
			{#if !option.disabled}
				<div
					class="
          flex flex-col gap-3 text-nowrap lg:justify-end
          lg:border-l lg:border-solid lg:border-neutral-200 lg:pl-6 lg:text-right
        "
				>
					{#each option.individualTickets as ticket (ticket.id)}
						<div>
							{#if ticket.discount && ticket.newPrice}
								<div class="flex gap-1 sm:justify-end">
									<p class="p-sm font-bold text-neutral-700 line-through">{ticket.price * 2} €</p>
									<p class="p-sm text-salmon-700 font-bold">{ticket.discount}</p>
								</div>
								<p class="text-price text-salmon-700">
									{ticket.newPrice * 2} €
								</p>
							{:else}
								<p class="text-price">
									{ticket.price * 2} €
								</p>
							{/if}
							<p class="p-sm font-bold text-neutral-700">2 adultos x {ticket.price} €</p>
							<p class="p-sm text-neutral-600">Tasas e impuestos incluidos</p>
						</div>
					{/each}

					{#if selected}
						<div class="flex flex-col gap-3">
							<button class="e-button"> Reservar ahora </button>
							<button class="e-button e-button-secondary"> Añadir al carrito </button>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/each}
</div>
