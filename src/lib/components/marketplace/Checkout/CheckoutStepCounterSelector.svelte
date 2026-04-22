<script lang="ts">
	// Types
	import type { ActivityOption } from '$lib/types';
	import { createPopover, melt } from '@melt-ui/svelte';

	// Libs
	import { fade } from 'svelte/transition';
	import { getCheckout } from '$lib/stores/checkout.svelte';

	// Icons
	import { User } from '$lib/icons/Linear';

	// Components
	import FakeSelectButton from '$lib/components/marketplace/FakeSelectButton.svelte';
	import CheckoutStepCounter from './CheckoutStepCounter.svelte';

	// Utils
	import { formatPassengerSummary } from '$lib/utils/passengers';

	type Ticket = ActivityOption['individualTickets'][number];

	type Props = {
		activeTicketGroups: Ticket[];
	};

	let { activeTicketGroups }: Props = $props();

	const checkout = getCheckout();
	const adultCount = $derived(checkout.counts.get('ADULT') ?? 0);

	const {
		elements: { trigger, content },
		states: { open }
	} = createPopover({
		forceVisible: true,
		closeOnOutsideClick: true,
		positioning: { sameWidth: true }
	});

	const summaryLabel = $derived(
		formatPassengerSummary(
			activeTicketGroups.map((t) => [t.group, checkout.counts.get(t.group) ?? 0])
		)
	);
</script>

<div class="relative w-full">
	<FakeSelectButton
		icon={User}
		placeholder="Selecciona asistentes"
		value={summaryLabel}
		open={$open}
		{trigger}
	/>
	{#if $open}
		<div
			transition:fade={{ duration: 150 }}
			use:melt={$content}
			class="absolute z-50 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
		>
			<div class="flex flex-col gap-4">
				<div class="divide-y divide-gray-200">
					{#each activeTicketGroups as ticket (ticket.id)}
						<div class="py-2 first:pt-0">
							<CheckoutStepCounter
								key={ticket.group}
								id={ticket.id}
								value={checkout.counts.get(ticket.group) ?? 0}
								maxvalue={ticket.adultRequired && adultCount === 0 ? 0 : 99}
								onchange={(v) => checkout.counts.set(ticket.group, v)}
							/>
							{#if ticket.adultRequired && adultCount === 0 && (checkout.counts.get(ticket.group) ?? 0) > 0}
								<p class="p-sm text-error-500">Se precisa al menos un ticket de adulto</p>
							{/if}
						</div>
					{/each}
				</div>

				<button type="button" class="e-button w-full" onclick={() => open.set(false)}
					>Aplicar</button
				>
			</div>
		</div>
	{/if}
</div>
