<script lang="ts">
	import * as m from '$paraglide/messages';

	type Props = {
		id: string | number;
		key: string;
		desc?: string;
		value: number;
		maxvalue: number;
		onchange?: (value: number) => void;
	};

	let { id, key, desc, value = $bindable(), maxvalue, onchange }: Props = $props();

	const messages = m as unknown as Record<string, () => string>;

	const label = $derived(messages[`enum_passengerKind_${key}_name`]?.() ?? key);
	const description = $derived(messages[`enum_passengerKind_${key}_description`]?.() ?? desc);
</script>

<div data-id={id} class="flex items-center justify-between gap-4">
	<div class="flex flex-col gap-0.5">
		<span class="font-bold text-[var(--color-text-primary,#111)]">{label}</span>
		{#if description}
			<span class="p-sm text-[var(--color-text-secondary,#6b7280)]">{description}</span>
		{/if}
	</div>
	<div class="flex shrink-0 items-center gap-3">
		<button
			type="button"
			class="flex size-8 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-[var(--color-border-default,#d1d5db)] bg-transparent text-[var(--color-text-primary,#111)] transition-colors hover:not-disabled:border-[var(--color-text-primary,#111)] disabled:cursor-not-allowed disabled:opacity-30"
			aria-label="Reducir"
			disabled={value <= 0}
			onclick={() => {
				if (value > 0) {
					value--;
					onchange?.(value);
				}
			}}
		>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d="M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			</svg>
		</button>
		<span class="p-base min-w-5 text-center font-medium">{value}</span>
		<button
			type="button"
			class="flex size-8 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-[var(--color-border-default,#d1d5db)] bg-transparent text-[var(--color-text-primary,#111)] transition-colors hover:not-disabled:border-[var(--color-text-primary,#111)] disabled:cursor-not-allowed disabled:opacity-30"
			aria-label="Aumentar"
			disabled={value >= maxvalue}
			onclick={() => {
				if (value < maxvalue) {
					value++;
					onchange?.(value);
				}
			}}
		>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			</svg>
		</button>
	</div>
</div>
